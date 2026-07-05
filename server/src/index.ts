import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

import {
  employees,
  candidates,
  jobVacancies,
  performanceReviews,
  climateResponses,
  climateParticipationTracks,
  vacationRequests,
  payslips,
  DEPARTMENTS
} from './db';
import { Employee, VacationRequest, PerformanceReview } from './types';
import { calculateVacationLimitDate, hasOverlappingVacation, auditPayroll, generateCNABRemittance } from './modules/payroll';
import { createAnonymousResponse, aggregateClimateReports } from './modules/climate';
import { calculateWeighted360Average, getConsolidatedPerformance } from './modules/performance';
import { calculateMatchingScore, parseResumeSkills } from './modules/talent';
import { getOnboardingTemplate, signAdmissionalDocument } from './modules/onboarding';
import { getHRAnalytics } from './modules/analytics';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// In-memory data states that can be mutated during runtime
let employeesState = [...employees];
let candidatesState = [...candidates];
let vacanciesState = [...jobVacancies];
let reviewsState = [...performanceReviews];
let climateResponsesState = [...climateResponses];
let participationTracksState = [...climateParticipationTracks];
let vacationsState = [...vacationRequests];
const documentsState: Record<string, any[]> = {}; // employeeId -> signedDocuments

// Onboarding trackers
const onboardingTasksState: Record<string, any[]> = {};

// Helper to initialize onboarding tasks for employees in onboarding status
employeesState.forEach(emp => {
  if (emp.status === 'ONBOARDING' && !onboardingTasksState[emp.id]) {
    onboardingTasksState[emp.id] = getOnboardingTemplate(emp.hireDate);
  }
});

// GET Departments
app.get('/api/departments', (req, res) => {
  res.json(DEPARTMENTS);
});

// GET Employees list with optional filters
app.get('/api/employees', (req, res) => {
  const { query, departmentId, status } = req.query;
  let filtered = [...employeesState];

  if (query) {
    const q = String(query).toLowerCase();
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.job.toLowerCase().includes(q) ||
      e.phone.includes(q)
    );
  }

  if (departmentId) {
    filtered = filtered.filter(e => e.departmentId === departmentId);
  }

  if (status) {
    filtered = filtered.filter(e => e.status === status);
  }

  res.json(filtered);
});

// GET Single Employee details
app.get('/api/employees/:id', (req, res) => {
  const emp = employeesState.find(e => e.id === req.params.id);
  if (!emp) {
    return res.status(404).json({ error: 'Colaborador não encontrado' });
  }
  res.json(emp);
});

// POST Add new employee (e.g. from Hired Candidate)
app.post('/api/employees', (req, res) => {
  const { name, email, role, departmentId, job, phone, image } = req.body;
  const newEmp: Employee = {
    id: String(employeesState.length + 1),
    name,
    email,
    role: role || 'EMPLOYEE',
    departmentId: departmentId || 'DEP_TECH',
    hireDate: new Date().toISOString(),
    status: 'ONBOARDING',
    careerPathId: role === 'MANAGER' ? 'PATH_LEAD' : 'PATH_DEV',
    salaryTier: 'TIER_1',
    job: job || 'Desenvolvedor(a)',
    phone: phone || '',
    image: image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80'
  };

  employeesState.push(newEmp);
  onboardingTasksState[newEmp.id] = getOnboardingTemplate(newEmp.hireDate);
  res.status(201).json(newEmp);
});

// GET Employee Onboarding Tasks
app.get('/api/employees/:id/onboarding', (req, res) => {
  const empId = req.params.id;
  const tasks = onboardingTasksState[empId] || [];
  const docs = documentsState[empId] || [];
  res.json({ tasks, documents: docs });
});

// POST Check Onboarding Task
app.post('/api/employees/:id/onboarding/check', (req, res) => {
  const empId = req.params.id;
  const { taskId, completed } = req.body;
  const tasks = onboardingTasksState[empId] || [];
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = completed;
  }
  res.json({ success: true, tasks });
});

// POST Upload & Sign Document (Audit Log)
app.post('/api/employees/:id/onboarding/upload', (req, res) => {
  const empId = req.params.id;
  const { fileName } = req.body;
  const emp = employeesState.find(e => e.id === empId);
  if (!emp) return res.status(404).json({ error: 'Colaborador não encontrado' });

  const signedDoc = signAdmissionalDocument(uuidv4(), fileName, emp.email);

  if (!documentsState[empId]) {
    documentsState[empId] = [];
  }
  documentsState[empId].push(signedDoc);

  // Auto transition to ACTIVE if onboarding tasks are mostly done
  const tasks = onboardingTasksState[empId] || [];
  if (tasks.every((t: any) => t.completed) || tasks.length === 0) {
    emp.status = 'ACTIVE';
  }

  res.json({ success: true, document: signedDoc, employeeStatus: emp.status });
});

// GET Talent Candidates (sorted by score)
app.get('/api/talent/candidates', (req, res) => {
  const sorted = [...candidatesState].sort((a, b) => (b.matchingScore || 0) - (a.matchingScore || 0));
  res.json(sorted);
});

// POST Create vacancy
app.post('/api/talent/vacancies', (req, res) => {
  const { title, description, departmentId, requirements } = req.body;
  const newVacancy: JobVacancy = {
    id: `VAC_${vacanciesState.length + 1}`,
    title,
    description,
    departmentId,
    requirements: requirements || [],
    templateGeneratedByIA: true
  };
  vacanciesState.push(newVacancy);

  // Re-match all screening candidates to this job
  candidatesState = candidatesState.map(cand => {
    const score = calculateMatchingScore(cand.skills, newVacancy.requirements);
    return { ...cand, matchingScore: score };
  });

  res.status(201).json(newVacancy);
});

// GET Vacancies list
app.get('/api/talent/vacancies', (req, res) => {
  res.json(vacanciesState);
});

// POST Submit Candidate Application
app.post('/api/talent/candidates/apply', (req, res) => {
  const { name, email, skills, resumeFileName } = req.body;
  
  // Extract skills from resume using resume parser if no skills provided
  const parsedSkills = skills && skills.length > 0 ? skills : parseResumeSkills(resumeFileName || 'front-end-resume.pdf');

  // Match against first job for simplicity
  const activeVacancy = vacanciesState[0];
  const score = activeVacancy ? calculateMatchingScore(parsedSkills, activeVacancy.requirements) : 80;

  const newCand: Candidate = {
    id: `CAND_${candidatesState.length + 1}`,
    name,
    email,
    skills: parsedSkills,
    matchingScore: score,
    status: 'SCREENING',
    notes: 'Parsed automatically by AI matching engine.'
  };

  candidatesState.push(newCand);
  res.status(201).json(newCand);
});

// POST Submit Performance Review (360)
app.post('/api/performance/reviews', (req, res) => {
  const { employeeId, evaluatorId, relationship, cycleId, scores } = req.body;
  
  const newReview: PerformanceReview = {
    id: `REV_${reviewsState.length + 1}`,
    employeeId,
    evaluatorId,
    relationship,
    cycleId,
    scores,
    submittedAt: new Date().toISOString()
  };

  reviewsState.push(newReview);
  res.status(201).json(newReview);
});

// GET Performance metrics for employee (weighted 360 averages)
app.get('/api/performance/reviews/:employeeId', (req, res) => {
  const employeeId = req.params.employeeId;
  const cycleId = 'CYCLE_2026_Q1'; // default Q1 cycle

  const reviews = reviewsState.filter(r => r.employeeId === employeeId && r.cycleId === cycleId);
  const consolidated = getConsolidatedPerformance(reviewsState, employeeId, cycleId);

  res.json({
    reviews,
    consolidated
  });
});

// GET Climate Survey Aggregation (respecting N>=3 rule)
app.get('/api/climate/aggregate', (req, res) => {
  const cycleId = 'CYCLE_2026_MAY';
  const aggregates = aggregateClimateReports(climateResponsesState, cycleId);
  res.json({
    cycleId,
    aggregates,
    globalENPS: getHRAnalytics(employeesState, climateResponsesState).enps
  });
});

// POST Submit Climate survey anonymously
app.post('/api/climate/respond', (req, res) => {
  const { employeeId, departmentId, enpsScore, sentimentRating } = req.body;
  const cycleId = 'CYCLE_2026_MAY';

  // Check if already responded
  const alreadyResponded = participationTracksState.some(
    p => p.employeeId === employeeId && p.cycleId === cycleId
  );

  if (alreadyResponded) {
    return res.status(400).json({ error: 'Colaborador já respondeu a este ciclo de clima.' });
  }

  const { response, track } = createAnonymousResponse(
    employeeId,
    cycleId,
    departmentId,
    enpsScore,
    sentimentRating
  );

  climateResponsesState.push(response);
  participationTracksState.push(track);

  res.status(201).json({ success: true, message: 'Resposta enviada com anonimato garantido.' });
});

// GET Payroll Inconsistencies Audit
app.get('/api/payroll/audit', (req, res) => {
  const inconsistencies = auditPayroll(employeesState);
  res.json({ inconsistencies });
});

// GET CNAB download
app.get('/api/payroll/cnab', (req, res) => {
  const cnabText = generateCNABRemittance(employeesState);
  res.setHeader('Content-Type', 'text/plain');
  res.send(cnabText);
});

// GET Vacations requested & approved
app.get('/api/payroll/vacations', (req, res) => {
  res.json(vacationsState);
});

// GET Concession limit date for employee
app.get('/api/payroll/vacations/limit/:employeeId', (req, res) => {
  const emp = employeesState.find(e => e.id === req.params.employeeId);
  if (!emp) return res.status(404).json({ error: 'Colaborador não encontrado' });
  const limitDate = calculateVacationLimitDate(emp.hireDate);
  res.json({ employeeId: emp.id, hireDate: emp.hireDate, limitDate: limitDate.toISOString() });
});

// POST Request Vacation (with overlap validation)
app.post('/api/payroll/vacations', (req, res) => {
  const { employeeId, startDate, endDate, reason } = req.body;

  const emp = employeesState.find(e => e.id === employeeId);
  if (!emp) return res.status(404).json({ error: 'Colaborador não encontrado' });

  // Rule: check for overlap
  const overlaps = hasOverlappingVacation(
    { employeeId, startDate, endDate },
    vacationsState,
    employeesState
  );

  if (overlaps) {
    return res.status(400).json({
      error: 'Solicitação de férias sobreposta a outro colaborador estratégico do mesmo time.'
    });
  }

  const newVacation: VacationRequest = {
    id: `VAC_REQ_${vacationsState.length + 1}`,
    employeeId,
    startDate,
    endDate,
    status: 'APPROVED', // Auto approved unless overlapped
    reason
  };

  vacationsState.push(newVacation);
  res.status(201).json(newVacation);
});

// GET Global Analytics summary
app.get('/api/analytics', (req, res) => {
  const summary = getHRAnalytics(employeesState, climateResponsesState);
  res.json(summary);
});

// GET Payslips list for active employee
app.get('/api/payslips/:employeeId', (req, res) => {
  const list = payslips.filter(p => p.employeeId === req.params.employeeId);
  res.json(list);
});

app.listen(PORT, () => {
  console.log(`[Kinship API] running at http://localhost:${PORT}`);
});
