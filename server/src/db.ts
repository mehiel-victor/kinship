import { Employee, Candidate, JobVacancy, PerformanceReview, ClimateResponse, ClimateParticipationTrack, VacationRequest, Payslip } from './types';

export const DEPARTMENTS = [
  { id: 'DEP_TECH', name: 'Tecnologia' },
  { id: 'DEP_DESIGN', name: 'Design' },
  { id: 'DEP_HR', name: 'Recursos Humanos' },
  { id: 'DEP_SALES', name: 'Vendas' }
];

export const employees: Employee[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@orbitatech.com',
    role: 'EMPLOYEE',
    departmentId: 'DEP_TECH',
    hireDate: '2019-12-02T00:00:00.000Z',
    status: 'ACTIVE',
    careerPathId: 'PATH_BACKEND',
    salaryTier: 'TIER_3',
    job: 'Back-end',
    phone: '5551234567890',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: '2',
    name: 'Roberto Souza',
    email: 'roberto.souza@orbitatech.com',
    role: 'EMPLOYEE',
    departmentId: 'DEP_TECH',
    hireDate: '2020-03-12T00:00:00.000Z',
    status: 'ACTIVE',
    careerPathId: 'PATH_FRONTEND',
    salaryTier: 'TIER_2',
    job: 'Front-end',
    phone: '5550321654789',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria.santos@orbitatech.com',
    role: 'MANAGER',
    departmentId: 'DEP_TECH',
    hireDate: '2020-03-15T00:00:00.000Z',
    status: 'ACTIVE',
    careerPathId: 'PATH_FRONTEND',
    salaryTier: 'TIER_4',
    job: 'Front-end Lead',
    phone: '5557894561230',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: '4',
    name: 'Cleber Oliveira',
    email: 'cleber.oliveira@orbitatech.com',
    role: 'EMPLOYEE',
    departmentId: 'DEP_TECH',
    hireDate: '2020-06-01T00:00:00.000Z',
    status: 'ACTIVE',
    careerPathId: 'PATH_BACKEND',
    salaryTier: 'TIER_2',
    job: 'Back-end',
    phone: '5557410258963',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: '5',
    name: 'Giovana Costa',
    email: 'giovana.costa@orbitatech.com',
    role: 'EMPLOYEE',
    departmentId: 'DEP_DESIGN',
    hireDate: '2020-06-20T00:00:00.000Z',
    status: 'ACTIVE',
    careerPathId: 'PATH_DESIGN',
    salaryTier: 'TIER_2',
    job: 'Designer',
    phone: '5553698520147',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: '6',
    name: 'Mario Rossi',
    email: 'mario.rossi@orbitatech.com',
    role: 'EMPLOYEE',
    departmentId: 'DEP_TECH',
    hireDate: '2020-10-01T00:00:00.000Z',
    status: 'ACTIVE',
    careerPathId: 'PATH_FRONTEND',
    salaryTier: 'TIER_1',
    job: 'Front-end',
    phone: '5551234567890',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: '7',
    name: 'Gabriel Gomes',
    email: 'gabriel.gomes@orbitatech.com',
    role: 'EMPLOYEE',
    departmentId: 'DEP_TECH',
    hireDate: '2021-01-01T00:00:00.000Z',
    status: 'ACTIVE',
    careerPathId: 'PATH_BACKEND',
    salaryTier: 'TIER_1',
    job: 'Back-end',
    phone: '5551234567890',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: '8',
    name: 'Carla Nogueira',
    email: 'carla.nogueira@orbitatech.com',
    role: 'HR',
    departmentId: 'DEP_HR',
    hireDate: '2021-03-01T00:00:00.000Z',
    status: 'ACTIVE',
    careerPathId: 'PATH_HR',
    salaryTier: 'TIER_3',
    job: 'Recrutadora',
    phone: '5551234567890',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: '10',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@orbitatech.com',
    role: 'HR',
    departmentId: 'DEP_HR',
    hireDate: '2021-05-01T00:00:00.000Z',
    status: 'ACTIVE',
    careerPathId: 'PATH_HR',
    salaryTier: 'TIER_3',
    job: 'RH Especialista',
    phone: '5551234567890',
    image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: '11',
    name: 'Aline Araujo',
    email: 'aline.araujo@orbitatech.com',
    role: 'EMPLOYEE',
    departmentId: 'DEP_TECH',
    hireDate: '2026-06-01T00:00:00.000Z',
    status: 'ONBOARDING',
    careerPathId: 'PATH_FRONTEND',
    salaryTier: 'TIER_1',
    job: 'Front-end Júnior',
    phone: '5551234567891',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=256&h=256&q=80'
  }
];

export const candidates: Candidate[] = [
  {
    id: 'CAND_1',
    name: 'Lucas Souza',
    email: 'lucas.souza@gmail.com',
    skills: ['React', 'TypeScript', 'CSS'],
    matchingScore: 88,
    status: 'SCREENING',
    notes: 'Ótima comunicação. Experiência de 2 anos.'
  },
  {
    id: 'CAND_2',
    name: 'Beatriz Santos',
    email: 'beatriz.s@gmail.com',
    skills: ['Node.js', 'Express', 'TypeScript', 'SQL'],
    matchingScore: 95,
    status: 'INTERVIEW',
    notes: 'Excelente background técnico.'
  }
];

export const jobVacancies: JobVacancy[] = [
  {
    id: 'VAC_1',
    title: 'Desenvolvedor(a) Front-end Pleno',
    description: 'Buscamos profissional experiente em React, TypeScript e Tailwind CSS para integrar nosso time de tecnologia.',
    departmentId: 'DEP_TECH',
    requirements: ['React', 'TypeScript', 'Tailwind CSS', 'Testes Unitários'],
    templateGeneratedByIA: true
  },
  {
    id: 'VAC_2',
    title: 'Desenvolvedor(a) Back-end Pleno',
    description: 'Profissional focado em escalabilidade de APIs, Node.js, Express e bancos de dados SQL/NoSQL.',
    departmentId: 'DEP_TECH',
    requirements: ['Node.js', 'Express', 'SQL', 'TypeScript'],
    templateGeneratedByIA: true
  }
];

export const performanceReviews: PerformanceReview[] = [
  // 360 evaluations for employee id '1' (João Silva)
  {
    id: 'REV_1',
    employeeId: '1',
    evaluatorId: '1', // SELF
    relationship: 'SELF',
    cycleId: 'CYCLE_2026_Q1',
    scores: [
      { competencyId: 'TECH', rating: 4, comment: 'Entreguei as features no prazo.' },
      { competencyId: 'CULTURE', rating: 5, comment: 'Sempre alinhado com a cultura.' }
    ],
    submittedAt: '2026-03-10T12:00:00.000Z'
  },
  {
    id: 'REV_2',
    employeeId: '1',
    evaluatorId: '3', // MANAGER (Maria Lead)
    relationship: 'MANAGER',
    cycleId: 'CYCLE_2026_Q1',
    scores: [
      { competencyId: 'TECH', rating: 5, comment: 'Código muito limpo e bem arquitetado.' },
      { competencyId: 'CULTURE', rating: 4, comment: 'Prestativo e colaborativo.' }
    ],
    submittedAt: '2026-03-12T14:30:00.000Z'
  },
  {
    id: 'REV_3',
    employeeId: '1',
    evaluatorId: '2', // PEER (Roberto)
    relationship: 'PEER',
    cycleId: 'CYCLE_2026_Q1',
    scores: [
      { competencyId: 'TECH', rating: 4, comment: 'Muito bom trabalhar junto.' },
      { competencyId: 'CULTURE', rating: 5, comment: 'Ajuda a equipe sempre.' }
    ],
    submittedAt: '2026-03-13T10:00:00.000Z'
  }
];

export const climateResponses: ClimateResponse[] = [
  {
    id: 'CLIM_R1',
    cycleId: 'CYCLE_2026_MAY',
    departmentId: 'DEP_TECH',
    enpsScore: 9,
    sentimentRating: 4,
    submittedAt: '2026-05-15T09:00:00.000Z'
  },
  {
    id: 'CLIM_R2',
    cycleId: 'CYCLE_2026_MAY',
    departmentId: 'DEP_TECH',
    enpsScore: 10,
    sentimentRating: 5,
    submittedAt: '2026-05-15T09:30:00.000Z'
  },
  {
    id: 'CLIM_R3',
    cycleId: 'CYCLE_2026_MAY',
    departmentId: 'DEP_TECH',
    enpsScore: 8,
    sentimentRating: 4,
    submittedAt: '2026-05-15T10:00:00.000Z'
  },
  {
    id: 'CLIM_R4',
    cycleId: 'CYCLE_2026_MAY',
    departmentId: 'DEP_HR', // Only 2 HR responders so far, or overall: HR only has 2 members! Let's check compliance.
    enpsScore: 8,
    sentimentRating: 4,
    submittedAt: '2026-05-16T11:00:00.000Z'
  }
];

export const climateParticipationTracks: ClimateParticipationTrack[] = [
  { employeeId: '1', cycleId: 'CYCLE_2026_MAY', submittedAt: '2026-05-15T09:00:00.000Z' },
  { employeeId: '2', cycleId: 'CYCLE_2026_MAY', submittedAt: '2026-05-15T09:30:00.000Z' },
  { employeeId: '4', cycleId: 'CYCLE_2026_MAY', submittedAt: '2026-05-15T10:00:00.000Z' },
  { employeeId: '8', cycleId: 'CYCLE_2026_MAY', submittedAt: '2026-05-16T11:00:00.000Z' }
];

export const vacationRequests: VacationRequest[] = [
  {
    id: 'VAC_REQ_1',
    employeeId: '1',
    startDate: '2026-07-01',
    endDate: '2026-07-15',
    status: 'APPROVED',
    reason: 'Férias regulares'
  }
];

export const payslips: Payslip[] = [
  {
    id: 'PAY_1',
    employeeId: '1',
    period: '2026-05',
    grossSalary: 8000,
    netPayable: 6200,
    deductions: 1800,
    bonuses: 0,
    pdfUrl: '/payslips/pay_1.pdf'
  }
];
