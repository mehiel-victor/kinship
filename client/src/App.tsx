import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  TrendingUp,
  Smile,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  UserCheck,
  FileCheck,
  Moon,
  Sun,
  Search,
  Upload,
  Plus,
  RefreshCw,
  Download,
  AlertCircle,
  Repeat,
  Mail,
  Lock,
  ArrowRight,
  LogOut,
  UserRoundCheck,
  Activity as ActivityIcon,
  ClipboardList,
  PlayCircle,
  RotateCcw,
  CheckCircle2,
  Building2,
  Route,
  Target,
  Database
} from "lucide-react";
import {
  FALLBACK_AUTH_USER,
  authenticateWithEmail,
  clearAuthUser,
  getStoredAuthUser,
  storeAuthUser,
  type AuthUser,
  type UserRole,
} from "./services/auth";
import { fetchAPI } from "./services/api";

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  EMPLOYEE: ["operations", "performance", "climate", "payroll"],
  MANAGER: ["operations", "dashboard", "employees", "talent", "performance", "redundancy", "climate", "payroll"],
  HR: ["operations", "dashboard", "employees", "talent", "performance", "redundancy", "climate", "payroll"],
  ADMIN: ["operations", "dashboard", "employees", "talent", "performance", "redundancy", "climate", "payroll"]
};

const getDefaultTab = (role: UserRole) => ROLE_PERMISSIONS[role]?.[0] || "performance";

function createInitialAuthState() {
  const storedUser = getStoredAuthUser();

  return {
    isAuthenticated: Boolean(storedUser),
    user: storedUser || FALLBACK_AUTH_USER,
  };
}

type Employee = {
  id: string;
  name: string;
  email: string;
  image: string;
  job: string;
  status: string;
  phone: string;
  hireDate: string;
  departmentId: string;
};

type OnboardingTask = {
  id: string;
  title: string;
  dueDate: string;
  phase: string;
  completed: boolean;
};

type SignedDocument = {
  id: string;
  fileName: string;
  signedAt: string;
  sha256Hash: string;
  auditSignature: string;
};

type Candidate = {
  id: string;
  name: string;
  email: string;
  notes: string;
  skills: string[];
  matchingScore: number;
};

type Vacancy = {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  requirements?: string[];
};

type ReviewScore = {
  competencyId: string;
  rating: number;
  comment: string;
};

type PerformanceReview = {
  id?: string;
  employeeId: string;
  evaluatorId?: string;
  relationship: string;
  cycleId?: string;
  scores: ReviewScore[];
  submittedAt: string;
};

type ClimateAggregate = {
  departmentId: string;
  averageENPS?: number;
  isMasked?: boolean;
};

type ClimateReport = {
  globalENPS: number;
  aggregates: ClimateAggregate[];
};

type PayrollAuditItem = {
  employeeId: string;
  issue: string;
};

type Vacation = {
  id?: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: string;
};

type Analytics = {
  headcount: number;
  activeCount: number;
  onboardingCount: number;
  enps: number;
  predictiveInsights: string[];
  turnoverRate: number;
  absenteeismRate: number;
};

type WorkspaceActivity = {
  id: string;
  type: "talent" | "performance" | "climate" | "payroll" | "onboarding";
  actorName: string;
  actorRole: string;
  message: string;
  target?: string;
  createdAt: string;
};

type OperationsStep = {
  title: string;
  role: string;
  email: string;
  tab?: string;
  objective: string;
  evidence: string;
};

type ProductUseCase = {
  problem: string;
  flow: string;
  impact: string;
  owner: string;
  icon: React.ComponentType<{ className?: string }>;
};

type PublicView = "landing" | "login";

type DiagnosticLeadForm = {
  name: string;
  email: string;
  company: string;
  headcount: string;
  riskArea: string;
  urgency: string;
  pain: string;
};

type DiagnosticLead = DiagnosticLeadForm & {
  submittedAt: string;
  source: "risk-desk-landing";
  score: number;
  tier: string;
  recommendation: string;
  nextStep: string;
  riskLabel: string;
  urgencyLabel: string;
};

const ACTIVITY_TONE_BY_TYPE: Record<WorkspaceActivity["type"], string> = {
  talent: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/40",
  performance: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900/40",
  climate: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40",
  payroll: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40",
  onboarding: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-900/40",
};

const OPERATIONS_STEPS: OperationsStep[] = [
  {
    title: "Gestora abre demanda real",
    role: "Gestora técnica",
    email: "maria.santos@kinship.app",
    tab: "talent",
    objective: "Criar uma vaga, acompanhar candidatos e registrar feedback 360 do time.",
    evidence: "RH/Admin enxerga a vaga e o feedback no histórico compartilhado.",
  },
  {
    title: "Colaborador gera sinal de clima e DP",
    role: "Colaborador",
    email: "joao.silva@kinship.app",
    tab: "climate",
    objective: "Responder eNPS, solicitar férias e consultar feedback consolidado.",
    evidence: "O dashboard recalcula clima e o calendário de férias aparece para RH/Admin.",
  },
  {
    title: "RH controla risco operacional",
    role: "Recursos Humanos",
    email: "carla.pereira@kinship.app",
    tab: "dashboard",
    objective: "Revisar histórico, onboarding, auditoria de folha, vagas e gaps de sucessão.",
    evidence: "People Ops tem rastreabilidade do que aconteceu por perfil.",
  },
  {
    title: "Admin valida governança",
    role: "Administrador",
    email: "admin@kinship.app",
    tab: "payroll",
    objective: "Verificar compliance, exportar CNAB e revisar visão geral.",
    evidence: "O workspace mostra permissões, dados compartilhados e operação auditável.",
  },
];

const OPERATIONS_PROOFS = [
  "Login por email/senha com RBAC por perfil.",
  "Dados compartilhados entre contas e histórico persistido.",
  "Histórico de ações para rastreabilidade operacional.",
  "Fluxos de People Ops conectados: Talent, Performance, Clima, DP e Onboarding.",
];

const PRODUCT_USE_CASES: ProductUseCase[] = [
  {
    problem: "Contratação sem contexto entre gestor e RH",
    flow: "A gestora abre vaga, acompanha candidatos e registra feedback 360 no mesmo histórico.",
    impact: "Reduz retrabalho e deixa a decisão de contratação rastreável.",
    owner: "Talent",
    icon: Briefcase,
  },
  {
    problem: "Sinais de clima chegam tarde demais",
    flow: "Colaboradores respondem eNPS e RH acompanha variação por área com anonimização.",
    impact: "Ajuda People Ops a priorizar intervenção antes de virar churn.",
    owner: "Clima",
    icon: TrendingUp,
  },
  {
    problem: "Risco trabalhista e DP operando no escuro",
    flow: "Solicitações de férias, auditoria de folha e CNAB ficam no fluxo de compliance.",
    impact: "Diminui erro operacional e evidencia governança para liderança.",
    owner: "DP",
    icon: ShieldCheck,
  },
];

const RISK_DESK_SIGNALS = [
  { label: "Onboarding travado", value: "3", detail: "documentos e tarefas paradas", icon: FileCheck },
  { label: "Clima em queda", value: "-8", detail: "pontos no time de tecnologia", icon: TrendingUp },
  { label: "Risco trabalhista", value: "1", detail: "bloqueio de férias críticas", icon: Calendar },
];

const PILOT_DELIVERABLES = [
  "Diagnóstico inicial de People Ops em 48h.",
  "Cockpit de risco com clima, DP, onboarding e sucessão.",
  "Roteiro semanal de ações para RH, gestores e liderança.",
  "Setup assistido com dados da operação ou planilha higienizada.",
];

const GTM_METRICS = [
  { label: "ICP inicial", value: "80-300", detail: "funcionários em tech/serviços B2B" },
  { label: "Piloto pago", value: "30 dias", detail: "setup assistido e relatório semanal" },
  { label: "Ticket alvo", value: "R$ 1.5k-3k", detail: "mensalidade para validação comercial" },
];

const RISK_AREA_LABELS: Record<string, string> = {
  "clima-turnover": "Clima e turnover",
  onboarding: "Onboarding e rampagem",
  "compliance-dp": "DP, férias e compliance",
  "performance-succession": "Performance e sucessão",
};

const URGENCY_LABELS: Record<string, string> = {
  "next-30-days": "Ação nos próximos 30 dias",
  quarter: "Resolver neste trimestre",
  discovery: "Mapear risco antes de escalar",
};

const qualifyDiagnosticLead = (form: DiagnosticLeadForm) => {
  const headcountScore = form.headcount === "80-150" || form.headcount === "150-300" ? 3 : form.headcount === "300+" ? 2 : 1;
  const urgencyScore = form.urgency === "next-30-days" ? 3 : form.urgency === "quarter" ? 2 : 1;
  const riskScore = form.riskArea === "clima-turnover" || form.riskArea === "compliance-dp" ? 2 : 1;
  const contextScore = form.pain.trim().length >= 80 ? 1 : 0;
  const score = headcountScore + urgencyScore + riskScore + contextScore;

  if (score >= 8) {
    return {
      score,
      tier: "Alta prioridade",
      recommendation: "Piloto pago recomendado",
      nextStep: "Enviar diagnóstico em 48h e propor kickoff executivo na mesma semana.",
    };
  }

  if (score >= 5) {
    return {
      score,
      tier: "Boa oportunidade",
      recommendation: "Discovery consultivo",
      nextStep: "Validar dono do problema, dados disponíveis e impacto financeiro esperado.",
    };
  }

  return {
    score,
    tier: "Nutrição",
    recommendation: "Conteúdo e entrevista exploratória",
    nextStep: "Entender maturidade de People Ops antes de ofertar piloto pago.",
  };
};

const asData = <T,>(value: unknown) => value as T;

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

const App: React.FC = () => {
  const [authState, setAuthState] = useState(createInitialAuthState);
  const currentUser = authState.user;
  const isAuthenticated = authState.isAuthenticated;

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" || 
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  // Current active tab
  const [activeTab, setActiveTab] = useState(() => getDefaultTab(currentUser.role));

  const [performanceViewTargetId, setPerformanceViewTargetId] = useState(currentUser.id);

  const [publicView, setPublicView] = useState<PublicView>("landing");
  const [diagnosticForm, setDiagnosticForm] = useState<DiagnosticLeadForm>({
    name: "",
    email: "",
    company: "",
    headcount: "",
    riskArea: "",
    urgency: "",
    pain: "",
  });
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticLead | null>(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    setPerformanceViewTargetId(currentUser.id);
  }, [currentUser.id]);

  // App States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Onboarding items
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([]);
  const [signedDocs, setSignedDocs] = useState<SignedDocument[]>([]);
  const [uploadingDocName, setUploadingDocName] = useState("");

  // Talent candidates and vacancies
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [newVacancy, setNewVacancy] = useState({ title: "", description: "", departmentId: "DEP_TECH", requirements: "" });

  // Performance reviews
  const [reviewsHistory, setReviewsHistory] = useState<PerformanceReview[]>([]);
  const [consolidatedScores, setConsolidatedScores] = useState<Record<string, number>>({});
  const [reviewForm, setReviewForm] = useState({ targetId: "", competencyId: "TECH", rating: 5, comment: "" });

  // Climate state
  const [climateReport, setClimateReport] = useState<ClimateReport | null>(null);
  const [climateForm, setClimateForm] = useState({ enpsScore: 10, sentimentRating: 5 });
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // Payroll / DP state
  const [payrollAudit, setPayrollAudit] = useState<PayrollAuditItem[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [vacationLimitDate, setVacationLimitDate] = useState<string | null>(null);
  const [vacationForm, setVacationForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [cnabPreview, setCnabPreview] = useState<string | null>(null);

  // Global Analytics
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activityLog, setActivityLog] = useState<WorkspaceActivity[]>([]);

  // Loading triggers
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Error handling
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const actorPayload = () => ({
    actorName: currentUser.name,
    actorRole: currentUser.role,
  });

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Load initial data
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        // Fetch Employees
        const emps = await fetchAPI(`/employees?query=${searchTerm}`);
        setEmployees(asData<Employee[]>(emps));

        // Fetch Analytics
        const analyticsData = await fetchAPI("/analytics");
        setAnalytics(asData<Analytics>(analyticsData));

        const activityData = await fetchAPI("/activity");
        setActivityLog(asData<WorkspaceActivity[]>(activityData));

        // Fetch Talent (Candidates and Vacancies)
        const candidatesData = await fetchAPI("/talent/candidates");
        setCandidates(asData<Candidate[]>(candidatesData));

        const vacanciesData = await fetchAPI("/talent/vacancies");
        setVacancies(asData<Vacancy[]>(vacanciesData));

        // Fetch Climate
        const climateData = await fetchAPI("/climate/aggregate");
        setClimateReport(asData<ClimateReport>(climateData));

        // Fetch Vacations & Audits
        const vacts = await fetchAPI("/payroll/vacations");
        setVacations(asData<Vacation[]>(vacts));

        const audit = await fetchAPI("/payroll/audit");
        setPayrollAudit(asData<{ inconsistencies: PayrollAuditItem[] }>(audit).inconsistencies);

        // Fetch limit date for logged-in user
        const limitRes = await fetchAPI(`/payroll/vacations/limit/${currentUser.id}`);
        setVacationLimitDate(asData<{ limitDate: string }>(limitRes).limitDate);

        setLoading(false);
      } catch (err: unknown) {
        console.error(err);
        setErrorMessage("Erro ao carregar dados do servidor. Certifique-se de que o backend está rodando na porta 3001.");
        setLoading(false);
      }
    };
    loadData();
  }, [searchTerm, refreshTrigger, currentUser.id, isAuthenticated]);

  // Fetch performance reviews for the active performance target
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadReviews = async () => {
      try {
        const reviewsRes = await fetchAPI(`/performance/reviews/${performanceViewTargetId}`);
        const performanceData = asData<{ consolidated: Record<string, number>; reviews: PerformanceReview[] }>(reviewsRes);
        setConsolidatedScores(performanceData.consolidated);
        setReviewsHistory(performanceData.reviews);
      } catch (err) {
        console.error(err);
      }
    };
    loadReviews();
  }, [performanceViewTargetId, refreshTrigger, isAuthenticated]);

  // Fetch onboarding details when selectedEmployee changes
  useEffect(() => {
    if (isAuthenticated && selectedEmployee) {
      const loadOnboarding = async () => {
        try {
          const data = await fetchAPI(`/employees/${selectedEmployee.id}/onboarding`);
          const onboarding = asData<{ tasks: OnboardingTask[]; documents: SignedDocument[] }>(data);
          setOnboardingTasks(onboarding.tasks);
          setSignedDocs(onboarding.documents);
        } catch (err) {
          console.error(err);
        }
      };
      loadOnboarding();
    }
  }, [selectedEmployee, isAuthenticated]);

  // Handle onboarding task checklist update
  const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
    if (!selectedEmployee) return;
    try {
      await fetchAPI(`/employees/${selectedEmployee.id}/onboarding/check`, {
        method: "POST",
        body: JSON.stringify({ taskId, completed: !currentStatus, ...actorPayload() })
      });
      // Refresh onboarding status
      const data = await fetchAPI(`/employees/${selectedEmployee.id}/onboarding`);
      setOnboardingTasks(asData<{ tasks: OnboardingTask[] }>(data).tasks);
      
      // Update local employee status if it changed
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  // Upload/sign admissional document
  const handleDocumentSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !uploadingDocName) return;
    try {
      const res = await fetchAPI(`/employees/${selectedEmployee.id}/onboarding/upload`, {
        method: "POST",
        body: JSON.stringify({ fileName: uploadingDocName, ...actorPayload() })
      });
      
      setUploadingDocName("");
      const uploadResult = asData<{ document: SignedDocument; employeeStatus: string }>(res);
      setSignedDocs(prev => [...prev, uploadResult.document]);
      
      if (uploadResult.employeeStatus === 'ACTIVE') {
        setSelectedEmployee((prev: Employee | null) => prev ? ({ ...prev, status: 'ACTIVE' }) : prev);
      }
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  // Create vacancy
  const handleCreateVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const reqsArray = newVacancy.requirements.split(",").map(r => r.trim()).filter(r => r);
      await fetchAPI("/talent/vacancies", {
        method: "POST",
        body: JSON.stringify({
          title: newVacancy.title,
          description: newVacancy.description,
          departmentId: newVacancy.departmentId,
          requirements: reqsArray,
          ...actorPayload()
        })
      });
      setNewVacancy({ title: "", description: "", departmentId: "DEP_TECH", requirements: "" });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Performance Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.targetId) return;
    try {
      await fetchAPI("/performance/reviews", {
        method: "POST",
        body: JSON.stringify({
          employeeId: reviewForm.targetId,
          evaluatorId: currentUser.id,
          relationship: currentUser.id === reviewForm.targetId ? "SELF" : currentUser.role === "MANAGER" ? "MANAGER" : "PEER",
          cycleId: "CYCLE_2026_Q1",
          scores: [{ competencyId: reviewForm.competencyId, rating: Number(reviewForm.rating), comment: reviewForm.comment }],
          ...actorPayload()
        })
      });
      setReviewForm(prev => ({ ...prev, comment: "" }));
      alert("Avaliação submetida com sucesso!");
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Climate Response
  const handleSubmitClimate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI("/climate/respond", {
        method: "POST",
        body: JSON.stringify({
          employeeId: currentUser.id,
          departmentId: currentUser.departmentId,
          enpsScore: Number(climateForm.enpsScore),
          sentimentRating: Number(climateForm.sentimentRating),
          ...actorPayload()
        })
      });
      setSurveySubmitted(true);
      setRefreshTrigger(prev => prev + 1);
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Erro ao submeter clima."));
    }
  };

  // Submit Vacation Request
  const handleSubmitVacation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI("/payroll/vacations", {
        method: "POST",
        body: JSON.stringify({
          employeeId: currentUser.id,
          startDate: vacationForm.startDate,
          endDate: vacationForm.endDate,
          reason: vacationForm.reason,
          ...actorPayload()
        })
      });
      setVacationForm({ startDate: "", endDate: "", reason: "" });
      alert("Férias aprovadas e agendadas com sucesso!");
      setRefreshTrigger(prev => prev + 1);
    } catch (err: unknown) {
      alert(`Bloqueio de Compliance: ${getErrorMessage(err, "Solicitação recusada.")}`);
    }
  };

  // Download CNAB remessa
  const handleCNABDownload = async () => {
    try {
      const text = await fetchAPI("/payroll/cnab");
      setCnabPreview(text);
      const element = document.createElement("a");
      const file = new Blob([text], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = "CNAB_FOLHA_PAGAMENTO.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetWorkspace = async () => {
    try {
      await fetchAPI("/workspace/reset", {
        method: "POST",
        body: JSON.stringify(actorPayload()),
      });
      setSelectedEmployee(null);
      setSurveySubmitted(false);
      setCnabPreview(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const startAuthenticatedSession = (user: AuthUser) => {
    setAuthState({ isAuthenticated: true, user });
    storeAuthUser(user);
    setActiveTab(getDefaultTab(user.role));
    setErrorMessage(null);
    setLoginError(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleOpenLogin = () => {
    setPublicView("login");
    setLoginError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDiagnosticCTA = () => {
    document.getElementById("diagnostic-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDiagnosticSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const qualification = qualifyDiagnosticLead(diagnosticForm);

    const lead: DiagnosticLead = {
      ...diagnosticForm,
      ...qualification,
      submittedAt: new Date().toISOString(),
      source: "risk-desk-landing",
      riskLabel: RISK_AREA_LABELS[diagnosticForm.riskArea] || "Risco não informado",
      urgencyLabel: URGENCY_LABELS[diagnosticForm.urgency] || "Urgência não informada",
    };

    const currentLeads = JSON.parse(localStorage.getItem("kinship.diagnostic.leads") || "[]") as unknown[];
    localStorage.setItem("kinship.diagnostic.leads", JSON.stringify([lead, ...currentLeads].slice(0, 25)));
    setDiagnosticResult(lead);
    setDiagnosticForm({ name: "", email: "", company: "", headcount: "", riskArea: "", urgency: "", pain: "" });
  };

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const user = authenticateWithEmail(loginForm.email, loginForm.password);
    if (!user) {
      setLoginError("Email ou senha inválidos.");
      return;
    }

    setLoginForm({ email: "", password: "" });
    startAuthenticatedSession(user);
  };

  const handleLogout = () => {
    clearAuthUser();
    setAuthState({ isAuthenticated: false, user: FALLBACK_AUTH_USER });
    setActiveTab(getDefaultTab(FALLBACK_AUTH_USER.role));
    setSelectedEmployee(null);
    setSurveySubmitted(false);
    setCnabPreview(null);
    setLoginForm({ email: "", password: "" });
    setLoginError(null);
    setPublicView("landing");
  };

  if (!isAuthenticated && publicView === "landing") {
    return (
      <div className="min-h-screen bg-slate-950 font-sans text-white">
        <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <img
                src="/kinship_logo.png"
                alt="Kinship"
                className="h-10 w-10 rounded-lg border border-white/10 object-cover object-top"
              />
              <div>
                <span className="block font-display text-lg font-black tracking-tight">Kinship</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Risk Desk</span>
              </div>
            </div>
            <nav className="hidden items-center gap-6 text-xs font-black uppercase tracking-wider text-slate-400 md:flex">
              <a href="#wedge" className="transition hover:text-white">Problema</a>
              <a href="#pilot" className="transition hover:text-white">Piloto</a>
              <a href="#diagnostic-form" className="transition hover:text-white">Diagnóstico</a>
            </nav>
            <button
              type="button"
              onClick={handleOpenLogin}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
            >
              Entrar
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main>
          <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 sm:px-8 lg:pb-24 lg:pt-36">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#07111f_0%,#0f172a_46%,#052f2f_100%)]" />
            <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:56px_56px]" />
            <div className="relative mx-auto max-w-7xl">
              <div className="max-w-4xl">
                <p className="mb-5 inline-flex items-center gap-2 rounded-lg border border-cyan-200/20 bg-cyan-200/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-cyan-100">
                  <ActivityIcon className="h-4 w-4" />
                  Piloto pago para People Ops
                </p>
                <h1 className="font-display text-6xl font-black leading-[0.92] tracking-tight sm:text-7xl lg:text-8xl">
                  Kinship Risk Desk
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
                  Um cockpit para Heads de RH e COOs detectarem risco de clima, onboarding, férias/compliance e sucessão antes de virar churn, retrabalho ou exposição trabalhista.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleDiagnosticCTA}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-cyan-950/40 transition hover:bg-cyan-200"
                  >
                    Agendar diagnóstico
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenLogin}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-black text-white transition hover:border-white/40 hover:bg-white/10"
                  >
                    Ver workspace
                  </button>
                </div>
                <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
                  {["Diagnóstico em 48h", "Plano semanal de risco", "Piloto assistido"].map((item) => (
                    <div key={item} className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-300">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
                <section className="rounded-lg border border-white/10 bg-slate-950/60 p-5 shadow-2xl shadow-black/30 backdrop-blur">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Risk cockpit</span>
                      <h2 className="mt-1 font-display text-2xl font-black">Riscos priorizados para esta semana</h2>
                    </div>
                    <ShieldCheck className="h-6 w-6 text-cyan-200" />
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {RISK_DESK_SIGNALS.map((signal) => {
                      const Icon = signal.icon;
                      return (
                        <article key={signal.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                          <div className="mb-6 flex items-center justify-between">
                            <Icon className="h-5 w-5 text-cyan-200" />
                            <span className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-100">atenção</span>
                          </div>
                          <strong className="block font-display text-4xl font-black">{signal.value}</strong>
                          <span className="mt-2 block text-sm font-black text-white">{signal.label}</span>
                          <span className="mt-1 block text-xs leading-5 text-slate-400">{signal.detail}</span>
                        </article>
                      );
                    })}
                  </div>
                  <div className="mt-4 rounded-lg border border-emerald-300/15 bg-emerald-300/10 p-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">próxima ação sugerida</span>
                    <p className="mt-2 text-sm leading-6 text-emerald-50">
                      Revisar onboarding executivo e férias críticas com RH e gestor responsável em até 48h.
                    </p>
                  </div>
                </section>

                <aside className="grid gap-4">
                  {GTM_METRICS.map((metric) => (
                    <div key={metric.label} className="rounded-lg border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{metric.label}</span>
                      <strong className="mt-2 block font-display text-4xl font-black">{metric.value}</strong>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{metric.detail}</p>
                    </div>
                  ))}
                </aside>
              </div>
            </div>
          </section>

          <section id="wedge" className="bg-[#f5f7fb] px-5 py-16 text-slate-950 sm:px-8 lg:py-24">
            <div className="mx-auto max-w-7xl">
              <div className="max-w-3xl">
                <span className="text-xs font-black uppercase tracking-[0.24em] text-cyan-700">wedge comercial</span>
                <h2 className="mt-3 font-display text-4xl font-black tracking-tight sm:text-5xl">Não venda mais um HRIS. Venda redução de risco operacional.</h2>
                <p className="mt-5 text-base leading-7 text-slate-600">
                  O comprador não quer outro sistema para alimentar. Ele quer saber onde agir primeiro e como provar que RH reduziu risco para o negócio.
                </p>
              </div>

              <div className="mt-10 grid gap-4 lg:grid-cols-3">
                {[
                  { title: "Sinais fragmentados", text: "Clima em um formulário, férias em planilha, onboarding em checklist e feedback em conversas soltas.", icon: Database },
                  { title: "Risco priorizado", text: "Kinship organiza esses sinais por severidade, dono da ação e impacto esperado para a operação.", icon: Target },
                  { title: "Ação rastreável", text: "Cada decisão fica conectada ao perfil, módulo e histórico para comprovar governança.", icon: Route },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                      <Icon className="h-6 w-6 text-cyan-700" />
                      <h3 className="mt-5 font-display text-xl font-black">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section id="pilot" className="bg-white px-5 py-16 text-slate-950 sm:px-8 lg:py-24">
            <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.24em] text-cyan-700">oferta de validação</span>
                <h2 className="mt-3 font-display text-4xl font-black tracking-tight sm:text-5xl">Piloto pago de 30 dias para provar valor antes de virar SaaS.</h2>
                <p className="mt-5 text-base leading-7 text-slate-600">
                  A meta é fechar 3 pilotos pagos com empresas no ICP, aprender com dados reais e só então transformar os fluxos mais valiosos em produto recorrente.
                </p>
                <div className="mt-6 rounded-lg border border-cyan-200 bg-cyan-50 p-5">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">preço inicial</span>
                  <strong className="mt-2 block font-display text-4xl font-black text-slate-950">R$ 1.500 - R$ 3.000/mês</strong>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Ticket suficiente para validar dor real sem virar projeto enterprise longo.</p>
                </div>
              </div>

              <div className="grid gap-3">
                {PILOT_DELIVERABLES.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="text-sm font-semibold leading-6 text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="diagnostic-form" className="bg-[#09111f] px-5 py-16 text-white sm:px-8 lg:py-24">
            <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(24rem,0.75fr)] lg:items-start">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">próximo passo comercial</span>
                <h2 className="mt-3 font-display text-4xl font-black tracking-tight sm:text-5xl">Agende um diagnóstico de People Ops.</h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                  Use este formulário para qualificar contas, priorizar oportunidades e preparar o diagnóstico executivo antes do primeiro contato comercial.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {["10 conversas com Heads de RH", "3 pilotos pagos", "1 caso de uso repetível", "90 dias para validar PMF"].map((item) => (
                    <div key={item} className="rounded-lg border border-white/10 bg-white/[0.05] p-4 text-sm font-bold text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
                {diagnosticResult && (
                  <div className="mt-5 rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">último lead qualificado</span>
                        <h3 className="mt-2 font-display text-2xl font-black text-white">{diagnosticResult.company}</h3>
                      </div>
                      <span className="rounded-lg border border-emerald-200/25 bg-emerald-200/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-50">
                        Score {diagnosticResult.score}/9
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-slate-950/30 p-3">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-100/70">Prioridade</span>
                        <strong className="mt-1 block text-sm text-emerald-50">{diagnosticResult.tier}</strong>
                      </div>
                      <div className="rounded-lg bg-slate-950/30 p-3">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-100/70">Oferta</span>
                        <strong className="mt-1 block text-sm text-emerald-50">{diagnosticResult.recommendation}</strong>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-emerald-50">{diagnosticResult.nextStep}</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleDiagnosticSubmit} className="rounded-lg border border-white/10 bg-white p-5 text-slate-950 shadow-2xl shadow-black/30">
                <div className="mb-5">
                  <h3 className="font-display text-2xl font-black">Diagnóstico inicial</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">Qualifique a empresa antes de apresentar o plano de ação.</p>
                </div>
                <div className="grid gap-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Nome</span>
                    <input
                      value={diagnosticForm.name}
                      onChange={(event) => setDiagnosticForm(prev => ({ ...prev, name: event.target.value }))}
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                      placeholder="Nome do responsável"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Email corporativo</span>
                    <input
                      type="email"
                      value={diagnosticForm.email}
                      onChange={(event) => setDiagnosticForm(prev => ({ ...prev, email: event.target.value }))}
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                      placeholder="nome@empresa.com"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Empresa</span>
                      <input
                        value={diagnosticForm.company}
                        onChange={(event) => setDiagnosticForm(prev => ({ ...prev, company: event.target.value }))}
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                        placeholder="Nome da empresa"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Headcount</span>
                      <select
                        value={diagnosticForm.headcount}
                        onChange={(event) => setDiagnosticForm(prev => ({ ...prev, headcount: event.target.value }))}
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                      >
                        <option value="">Selecione</option>
                        <option value="50-80">50-80</option>
                        <option value="80-150">80-150</option>
                        <option value="150-300">150-300</option>
                        <option value="300+">300+</option>
                      </select>
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Área de risco</span>
                      <select
                        value={diagnosticForm.riskArea}
                        onChange={(event) => setDiagnosticForm(prev => ({ ...prev, riskArea: event.target.value }))}
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                      >
                        <option value="">Selecione</option>
                        {Object.entries(RISK_AREA_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Urgência</span>
                      <select
                        value={diagnosticForm.urgency}
                        onChange={(event) => setDiagnosticForm(prev => ({ ...prev, urgency: event.target.value }))}
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                      >
                        <option value="">Selecione</option>
                        {Object.entries(URGENCY_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Maior risco hoje</span>
                    <textarea
                      value={diagnosticForm.pain}
                      onChange={(event) => setDiagnosticForm(prev => ({ ...prev, pain: event.target.value }))}
                      required
                      rows={4}
                      className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                      placeholder="Ex: turnover, onboarding lento, férias críticas, baixa visibilidade de clima..."
                    />
                  </label>
                </div>
                {diagnosticResult && (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
                    Diagnóstico registrado como {diagnosticResult.tier.toLowerCase()}. Lead salvo no pipeline comercial.
                  </div>
                )}
                <button
                  type="submit"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-cyan-800"
                >
                  Solicitar diagnóstico
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] font-sans text-slate-950">
        <main className="min-h-screen grid lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.72fr)]">
          <section className="relative order-2 overflow-hidden bg-[#09111f] px-6 py-8 text-white sm:px-10 lg:order-1 lg:px-14 lg:py-12">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,22,39,0.98),rgba(6,11,20,0.96)),radial-gradient(circle_at_78%_18%,rgba(20,184,166,0.28),transparent_30%),radial-gradient(circle_at_22%_4%,rgba(99,102,241,0.22),transparent_34%)]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

            <div className="relative flex min-h-full flex-col">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/kinship_logo.png"
                    alt="Kinship"
                    className="h-11 w-11 rounded-xl border border-white/10 object-cover object-top shadow-2xl"
                  />
                  <div>
                    <span className="block font-display text-xl font-extrabold tracking-tight">Kinship</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/80">People OS</span>
                  </div>
                </div>
                <span className="hidden items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold text-emerald-100 sm:inline-flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
                  Plataforma online
                </span>
              </div>

              <div className="mt-16 max-w-3xl lg:mt-20">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                  <ShieldCheck className="h-4 w-4" />
                  Acesso seguro ao workspace
                </p>
                <h1 className="max-w-4xl font-display text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                  Decisões de People Ops em uma única central.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Entre no ambiente Kinship para acompanhar clima, talent acquisition, feedback, compliance de DP e trilhas de onboarding com permissões por perfil.
                </p>
              </div>

              <div className="mt-10 grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/30 backdrop-blur">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Command center</span>
                      <h2 className="mt-1 font-display text-lg font-extrabold text-white">Operação hoje</h2>
                    </div>
                    <ActivityIcon className="h-5 w-5 text-cyan-200" />
                  </div>
                  <div className="grid gap-4 p-5 sm:grid-cols-3">
                    {[
                      { label: "Headcount ativo", value: "128", tone: "text-cyan-200" },
                      { label: "eNPS global", value: "74", tone: "text-emerald-200" },
                      { label: "Riscos abertos", value: "06", tone: "text-amber-200" },
                    ].map((metric) => (
                      <div key={metric.label} className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">{metric.label}</span>
                        <strong className={`mt-2 block font-display text-3xl font-black ${metric.tone}`}>{metric.value}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-3 px-5 pb-5">
                    {[
                      { title: "Onboarding executivo", detail: "3 documentos aguardando assinatura", icon: FileCheck },
                      { title: "Pulso de clima", detail: "Tecnologia caiu 8 pts em 14 dias", icon: TrendingUp },
                      { title: "Folha e férias", detail: "1 bloqueio de compliance detectado", icon: Calendar },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-cyan-100">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-slate-100">{item.title}</span>
                            <span className="block truncate text-xs text-slate-400">{item.detail}</span>
                          </span>
                          <ArrowRight className="h-4 w-4 text-slate-500" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4">
                  {[
                    { label: "Perfis com RBAC", value: "4", icon: UserRoundCheck },
                    { label: "Módulos ativos", value: "7", icon: Route },
                    { label: "Auditoria ativa", value: "On", icon: Database },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
                        <Icon className="mb-4 h-5 w-5 text-cyan-200" />
                        <strong className="block font-display text-3xl font-black">{item.value}</strong>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="relative order-1 flex min-h-screen items-center justify-center bg-[#f5f7fb] px-6 py-10 sm:px-10 lg:order-2">
            <button
              type="button"
              onClick={() => setPublicView("landing")}
              className="absolute right-6 top-6 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-500 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700"
            >
              Voltar ao site
            </button>
            <div className="w-full max-w-[29rem]">
              <div className="mb-7">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                  <Building2 className="h-4 w-4 text-cyan-600" />
                  Workspace Kinship
                </span>
                <h2 className="font-display text-4xl font-black tracking-tight text-slate-950">Acesse sua operação.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Use email e senha para entrar com as permissões do seu papel na plataforma.
                </p>
              </div>

              <form onSubmit={handleLogin} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
                <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Sessão protegida</span>
                    <span className="mt-1 block text-sm font-bold text-slate-700">Acesso por perfil corporativo</span>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Email corporativo</span>
                    <span className="relative block">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={(event) => setLoginForm(prev => ({ ...prev, email: event.target.value }))}
                        autoComplete="email"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                        placeholder="nome@empresa.com"
                      />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Senha</span>
                    <span className="relative block">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={(event) => setLoginForm(prev => ({ ...prev, password: event.target.value }))}
                        autoComplete="current-password"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                        placeholder="Digite sua senha"
                      />
                    </span>
                  </label>
                </div>

                {loginError && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-slate-950/20 transition hover:bg-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                >
                  Entrar no workspace
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="mt-5 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-3">
                  {[
                    { label: "SSO", detail: "SAML/OIDC", icon: ShieldCheck },
                    { label: "MFA", detail: "Adaptativo", icon: UserRoundCheck },
                    { label: "Auditoria", detail: "Sessões", icon: FileCheck },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-xl bg-slate-50 p-3">
                        <Icon className="mb-2 h-4 w-4 text-cyan-700" />
                        <span className="block text-[11px] font-black uppercase tracking-wider text-slate-700">{item.label}</span>
                        <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.detail}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold leading-5 text-slate-500">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Acesso provisionado pelo administrador da organização.</span>
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Sidebar navigation */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <img 
              src="/kinship_logo.png" 
              alt="KS Logo" 
              className="h-10 w-10 rounded-xl object-cover object-top shadow-md border border-slate-200/10"
            />
            <div>
              <span className="font-display font-bold text-lg leading-none block bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Kinship
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">People & Culture</span>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: "operations", label: "Cockpit Operacional", icon: ClipboardList },
              { id: "dashboard", label: "Analytics & Clima", icon: LayoutDashboard },
              { id: "employees", label: "Colaboradores", icon: Users },
              { id: "talent", label: "Talent & Vagas", icon: Briefcase },
              { id: "performance", label: "Feedback 360°", icon: TrendingUp },
              { id: "redundancy", label: "Redundância 360", icon: Repeat },
              { id: "climate", label: "Pesquisa Clima", icon: Smile },
              { id: "payroll", label: "DP & Compliance", icon: ShieldCheck }
            ]
            .filter(item => (ROLE_PERMISSIONS[currentUser.role] || []).includes(item.id))
            .map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Authenticated user and settings */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/70">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Sessão autenticada
            </span>
            <span className="inline-flex rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
              {currentUser.role}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="truncate">
              <p className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
                title="Alternar Tema"
              >
                {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
                title="Sair"
              >
                <LogOut className="h-4 w-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white">
              {activeTab === "operations" && "Cockpit Operacional"}
              {activeTab === "dashboard" && "Analytics & Clima"}
              {activeTab === "employees" && "Gestão de Colaboradores"}
              {activeTab === "talent" && "Talent Acquisition & Vagas"}
              {activeTab === "performance" && "Feedback 360°"}
              {activeTab === "redundancy" && "Análise de Redundância 360°"}
              {activeTab === "climate" && "Pesquisa de Clima"}
              {activeTab === "payroll" && "Departamento Pessoal & Compliance"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="Recarregar dados"
            >
              <RefreshCw className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </button>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Role: {currentUser.role}
            </span>
          </div>
        </header>

        {/* Content container */}
        <div className="flex-1 overflow-y-auto p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Problema com a API</h4>
                <p className="text-xs mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="h-full flex items-center justify-center flex-col gap-3">
              <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Carregando dados da plataforma...</span>
            </div>
          ) : (
            <>
              {/* TAB 0: OPERATIONS COCKPIT */}
              {activeTab === "operations" && (
                <div className="space-y-8">
                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-sm dark:border-slate-800">
                    <div className="grid gap-8 p-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] lg:p-10">
                      <div>
                        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-100">
                          <Building2 className="h-4 w-4" />
                          Cockpit operacional
                        </p>
                        <h2 className="max-w-3xl font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                          Conduza a operação de People Ops do risco até a evidência.
                        </h2>
                        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                          O workspace acompanha uma empresa em crescimento que precisa reduzir risco trabalhista, acelerar onboarding e dar visibilidade para gestores. Use perfis diferentes para criar ações e acompanhar o impacto no produto.
                        </p>
                      </div>

                      <div className="grid gap-3">
                        {[
                          { label: "Contas com RBAC", value: "4", icon: UserRoundCheck },
                          { label: "Módulos conectados", value: "7", icon: Route },
                          { label: "Histórico auditável", value: "Ativo", icon: Database },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] p-4">
                              <div>
                                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">{item.label}</span>
                                <strong className="mt-1 block font-display text-2xl font-black">{item.value}</strong>
                              </div>
                              <Icon className="h-5 w-5 text-indigo-300" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="mb-4 flex items-end justify-between gap-4">
                      <div>
                        <h3 className="font-display text-xl font-extrabold text-slate-950 dark:text-white">
                          Problemas reais que a Kinship resolve
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Cada cenário conecta uma dor de empresa a uma evidência operacional no produto.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-3">
                      {PRODUCT_USE_CASES.map((useCase) => {
                        const Icon = useCase.icon;
                        return (
                          <article key={useCase.problem} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                                <Icon className="h-5 w-5" />
                              </span>
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                {useCase.owner}
                              </span>
                            </div>
                            <h4 className="font-display text-base font-extrabold text-slate-950 dark:text-white">
                              {useCase.problem}
                            </h4>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                              {useCase.flow}
                            </p>
                            <p className="mt-4 border-t border-slate-100 pt-4 text-xs font-semibold leading-5 text-emerald-700 dark:border-slate-800 dark:text-emerald-300">
                              {useCase.impact}
                            </p>
                          </article>
                        );
                      })}
                    </div>
                  </section>

                  <div className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(22rem,0.7fr)]">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <h3 className="font-display text-xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                            <PlayCircle className="h-5 w-5 text-indigo-500" /> Plano operacional
                          </h3>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Siga a sequência ou abra direto o módulo disponível para a conta atual.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetWorkspace}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-900/70 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reiniciar cenário
                        </button>
                      </div>

                      <div className="grid gap-4">
                        {OPERATIONS_STEPS.map((step, index) => {
                          const canOpenTab = step.tab ? ROLE_PERMISSIONS[currentUser.role].includes(step.tab) : false;
                          return (
                            <article key={step.title} className="grid gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-start">
                              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-display text-sm font-black text-white">
                                {index + 1}
                              </span>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-display text-base font-extrabold text-slate-950 dark:text-white">{step.title}</h4>
                                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                                    {step.role}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300">{step.email}</p>
                                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.objective}</p>
                                <p className="mt-2 text-xs leading-5 text-slate-400">{step.evidence}</p>
                              </div>
                              <button
                                type="button"
                                disabled={!canOpenTab}
                                onClick={() => step.tab && setActiveTab(step.tab)}
                                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                                  canOpenTab
                                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                                    : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                                }`}
                              >
                                Abrir módulo
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            </article>
                          );
                        })}
                      </div>
                    </section>

                    <aside className="space-y-6">
                      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="font-display text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                          <Target className="h-5 w-5 text-indigo-500" /> O que acompanhar
                        </h3>
                        <div className="mt-4 grid gap-3">
                          {OPERATIONS_PROOFS.map((proof) => (
                            <div key={proof} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              <span className="text-sm leading-5 text-slate-600 dark:text-slate-300">{proof}</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="font-display text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                          <ActivityIcon className="h-5 w-5 text-indigo-500" /> Últimas evidências
                        </h3>
                        <div className="mt-4 grid gap-3">
                          {activityLog.slice(0, 4).map((activity) => (
                            <div key={activity.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
                              <div className="flex items-center justify-between gap-3">
                                <span className={`rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wider ${ACTIVITY_TONE_BY_TYPE[activity.type]}`}>
                                  {activity.type}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{activity.actorRole}</span>
                              </div>
                              <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                                <strong>{activity.actorName}</strong> {activity.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </aside>
                  </div>
                </div>
              )}

              {/* TAB 1: DASHBOARD (ANALYTICS) */}
              {activeTab === "dashboard" && (
                <div className="space-y-8">
                  {/* Cards container */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {currentUser.role === 'MANAGER' ? (
                      [
                        { label: "Colaboradores sob minha gestão", val: employees.filter(e => e.departmentId === currentUser.departmentId).length, color: "from-blue-500 to-indigo-500" },
                        { label: "Status Ativos", val: employees.filter(e => e.departmentId === currentUser.departmentId && e.status === 'ACTIVE').length, color: "from-emerald-500 to-teal-500" },
                        { label: "Em Onboarding", val: employees.filter(e => e.departmentId === currentUser.departmentId && e.status === 'ONBOARDING').length, color: "from-amber-500 to-orange-500" },
                        { label: "eNPS da Tecnologia", val: climateReport?.aggregates?.find((a) => a.departmentId === currentUser.departmentId)?.averageENPS || 72, color: "from-purple-500 to-pink-500", note: "Foco setorial" }
                      ].map((card, i) => (
                        <div key={i} className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                          <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${card.color}`}></div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{card.label}</p>
                          <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">{card.val}</h2>
                          {card.note && <p className="text-[10px] text-slate-500 mt-2">{card.note}</p>}
                        </div>
                      ))
                    ) : (
                      [
                        { label: "Headcount Total", val: analytics?.headcount || employees.length, color: "from-blue-500 to-indigo-500" },
                        { label: "Ativos", val: analytics?.activeCount || 0, color: "from-emerald-500 to-teal-500" },
                        { label: "Onboarding Pendente", val: analytics?.onboardingCount || 0, color: "from-amber-500 to-orange-500" },
                        { label: "eNPS Geral", val: `${analytics?.enps || 0}`, color: "from-purple-500 to-pink-500", note: "Promotores vs Detratores" }
                      ].map((card, i) => (
                        <div key={i} className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                          <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${card.color}`}></div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{card.label}</p>
                          <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">{card.val}</h2>
                          {card.note && <p className="text-[10px] text-slate-500 mt-2">{card.note}</p>}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Predictive insights and graphs */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Insights card */}
                    <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                          <TrendingUp className="text-indigo-500 h-5 w-5" /> People Analytics - Insights Preditivos
                        </h3>
                        <div className="space-y-4">
                          {currentUser.role === 'MANAGER' ? (
                            <>
                              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs flex gap-3">
                                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                                <p className="leading-relaxed">Alerta de Sobrecarga: Desenvolvedores da Tecnologia registraram aumento de 15% nas horas extras este mês. Risco de Burnout moderado.</p>
                              </div>
                              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 text-xs flex gap-3">
                                <AlertCircle className="h-5 w-5 shrink-0 text-blue-500" />
                                <p className="leading-relaxed">Recomendação de Gestão: Agendar conversas de 1:1 com os colaboradores em onboarding para acelerar a curva de aprendizado.</p>
                              </div>
                            </>
                          ) : (
                            analytics?.predictiveInsights?.map((insight: string, idx: number) => (
                              <div key={idx} className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs flex gap-3">
                                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                                <p className="leading-relaxed">{insight}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between text-xs text-slate-400">
                        <span>Taxa de Rotatividade (Turnover): {analytics?.turnoverRate}%/ano</span>
                        <span>Absenteísmo Médio: {analytics?.absenteeismRate}%</span>
                      </div>
                    </div>

                    {/* Climate overall indicators */}
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                      <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-4">Métricas de Clima</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-2">
                            <span>Pontuação eNPS</span>
                            <span className="text-indigo-500">{climateReport?.globalENPS || 0}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            {/* range -100 to 100 mapped to 0 to 100 */}
                            <div 
                              className="h-full bg-indigo-500" 
                              style={{ width: `${Math.max(0, Math.min(100, ((climateReport?.globalENPS || 0) + 100) / 2))}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Climate responses list */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pesquisa Anônima por Área</h4>
                          <div className="space-y-3">
                            {climateReport?.aggregates?.map((agg) => (
                              <div key={agg.departmentId} className="flex justify-between items-center text-xs">
                                <span className="font-medium">{agg.departmentId === 'DEP_TECH' ? 'Tecnologia' : agg.departmentId === 'DEP_HR' ? 'Recursos Humanos' : agg.departmentId}</span>
                                {agg.isMasked ? (
                                  <span className="text-slate-400 italic px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Dados ocultos (N &lt; 3)</span>
                                ) : (
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">eNPS Médio: {agg.averageENPS}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">
                      <div>
                        <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <ActivityIcon className="text-indigo-500 h-5 w-5" /> Atividade entre contas
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Ações persistidas no navegador: saia, entre com outro email e veja o mesmo histórico.
                        </p>
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                        Histórico operacional persistido
                      </span>
                    </div>

                    {activityLog.length > 0 ? (
                      <div className="grid gap-3">
                        {activityLog.slice(0, 6).map((activity) => (
                          <div key={activity.id} className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                            <span className={`inline-flex w-fit rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${ACTIVITY_TONE_BY_TYPE[activity.type]}`}>
                              {activity.type}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {activity.actorName} <span className="font-normal text-slate-500 dark:text-slate-400">{activity.message}</span>
                              </p>
                              {activity.target && (
                                <p className="mt-1 truncate text-xs text-slate-400">{activity.target}</p>
                              )}
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">{activity.actorRole}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(activity.createdAt).toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-400 dark:border-slate-800">
                        Nenhuma ação compartilhada registrada ainda.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: EMPLOYEES & ONBOARDING */}
              {activeTab === "employees" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left part: Search list */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2">
                      <Search className="h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Pesquise por nome, cargo ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent text-sm w-full outline-none text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-xs">
                            <tr>
                              <th className="px-6 py-4">Foto / Nome</th>
                              <th className="px-6 py-4">Cargo</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4">Telefone</th>
                              <th className="px-6 py-4">Admissão</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {employees
                              .filter(emp => currentUser.role === 'HR' || currentUser.role === 'ADMIN' ? true : emp.departmentId === currentUser.departmentId)
                              .map(emp => (
                              <tr
                                key={emp.id}
                                onClick={() => setSelectedEmployee(emp)}
                                className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${selectedEmployee?.id === emp.id ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
                              >
                                <td className="px-6 py-4 flex items-center gap-3">
                                  <img src={emp.image} alt={emp.name} className="h-10 w-10 rounded-full object-cover bg-slate-100" />
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{emp.name}</p>
                                    <p className="text-[10px] text-slate-400">{emp.email}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{emp.job}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    emp.status === 'ACTIVE'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                      : emp.status === 'ONBOARDING'
                                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                  }`}>
                                    {emp.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{emp.phone}</td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                  {new Date(emp.hireDate).toLocaleDateString('pt-BR')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right part: Employee Details & Onboarding Progress */}
                  <div className="space-y-6">
                    {selectedEmployee ? (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="text-center">
                          <img src={selectedEmployee.image} alt={selectedEmployee.name} className="h-20 w-20 rounded-full object-cover mx-auto mb-4 border border-slate-200 dark:border-slate-800 bg-slate-100" />
                          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">{selectedEmployee.name}</h3>
                          <p className="text-xs text-slate-400 mt-1">{selectedEmployee.job}</p>
                          <p className="text-xs font-medium text-slate-500 mt-1">Status: {selectedEmployee.status}</p>
                        </div>

                        {selectedEmployee.status === 'ONBOARDING' ? (
                          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-6">
                            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                              <UserCheck className="text-amber-500 h-5 w-5" /> Trilha Onboarding (30-60-90 dias)
                            </h4>
                            
                            {/* Tasks checklist */}
                            <div className="space-y-3">
                              {onboardingTasks.map(task => (
                                <label key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => handleTaskToggle(task.id, task.completed)}
                                    className="mt-1 accent-indigo-500"
                                  />
                                  <div>
                                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">{task.title}</span>
                                    <span className="text-[10px] text-slate-400">Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')} ({task.phase})</span>
                                  </div>
                                </label>
                              ))}
                            </div>

                            {/* Document upload self-service */}
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <FileCheck className="text-indigo-500 h-5 w-5" /> Assinatura Eletrônica de Documentos
                              </h4>
                              
                              <form onSubmit={handleDocumentSign} className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Ex: Contrato_Admissao.pdf"
                                  value={uploadingDocName}
                                  onChange={(e) => setUploadingDocName(e.target.value)}
                                  className="text-xs border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg px-3 py-2 flex-1 outline-none text-slate-800 dark:text-slate-200"
                                />
                                <button
                                  type="submit"
                                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-1 shrink-0"
                                >
                                  <Upload className="h-3.5 w-3.5" /> Assinar
                                </button>
                              </form>

                              {/* Audit trail */}
                              {signedDocs.length > 0 && (
                                <div className="mt-4 space-y-3">
                                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Documentos Auditados (SHA-256)</span>
                                  {signedDocs.map((doc, idx) => (
                                    <div key={idx} className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 text-[10px] space-y-1 font-mono text-emerald-800 dark:text-emerald-300">
                                      <p className="font-bold">{doc.fileName}</p>
                                      <p className="truncate">Hash: {doc.sha256Hash}</p>
                                      <p>Audit-Stamp: {doc.auditSignature.substring(0, 16)}...</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                            <span className="text-xs text-slate-500 block leading-relaxed">
                              Este colaborador já concluiu o onboarding digital e está em modo <strong>ATIVO</strong>.
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-400">
                        Selecione um funcionário da lista para gerenciar o onboarding ou documentos.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: TALENT (RECRUITMENT) */}
              {activeTab === "talent" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left block: Candidates list sorted by matchingScore */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-4">Pipeline de Candidatos (Foco Score IA)</h3>
                      <div className="space-y-4">
                        {candidates.map((cand) => (
                          <div key={cand.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-900/40">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{cand.name}</span>
                                <span className="text-[10px] text-slate-400">({cand.email})</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Anotações: {cand.notes}</p>
                              <div className="flex gap-1.5 mt-2 flex-wrap">
                                {cand.skills.map((skill: string, sidx: number) => (
                                  <span key={sidx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[10px] font-semibold">{skill}</span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="text-right shrink-0">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Score IA Match</span>
                              <span className={`inline-block px-3 py-1.5 rounded-lg font-display font-extrabold text-sm ${
                                cand.matchingScore >= 90
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                  : cand.matchingScore >= 80
                                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                              }`}>
                                {cand.matchingScore || 0}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right block: Vacancies and New Vacancy template builder */}
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                      <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Plus className="text-indigo-500 h-5 w-5" /> Nova Vaga com IA
                      </h3>
                      
                      <form onSubmit={handleCreateVacancy} className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 block mb-1">Título da Vaga</label>
                          <input
                            type="text"
                            placeholder="Ex: Desenvolvedor React Senior"
                            value={newVacancy.title}
                            onChange={(e) => setNewVacancy(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg px-3 py-2 outline-none text-slate-800 dark:text-slate-200"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-500 block mb-1">Descrição</label>
                          <textarea
                            placeholder="Descreva a vaga para a IA analisar..."
                            value={newVacancy.description}
                            onChange={(e) => setNewVacancy(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg px-3 py-2 outline-none h-20 text-slate-800 dark:text-slate-200"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-500 block mb-1">Requisitos (separados por vírgula)</label>
                          <input
                            type="text"
                            placeholder="React, TypeScript, CSS"
                            value={newVacancy.requirements}
                            onChange={(e) => setNewVacancy(prev => ({ ...prev, requirements: e.target.value }))}
                            className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg px-3 py-2 outline-none text-slate-800 dark:text-slate-200"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs py-2.5 rounded-lg font-bold flex items-center justify-center gap-2"
                        >
                          Gerar Template por IA
                        </button>
                      </form>
                    </div>

                    {/* Active Vacancies */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white mb-4">Vagas Publicadas ({vacancies.length})</h3>
                      <div className="space-y-4">
                        {vacancies.map(vac => (
                          <div key={vac.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                            <h4 className="text-xs font-bold text-slate-850 dark:text-slate-150">{vac.title}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-2">{vac.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PERFORMANCE (360° REVIEWS) */}
              {activeTab === "performance" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Performance scores logic */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                      {['HR', 'ADMIN'].includes(currentUser.role) ? (
                        <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 flex-wrap">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visualizar Avaliações de:</span>
                          <select
                            value={performanceViewTargetId}
                            onChange={(e) => setPerformanceViewTargetId(e.target.value)}
                            className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-none text-slate-800 dark:text-slate-200"
                          >
                            {employees
                             .filter(e => {
                               if (currentUser.role === 'EMPLOYEE' || currentUser.role === 'MANAGER') {
                                 return e.departmentId === currentUser.departmentId;
                               }
                               return true;
                             })
                             .map(e => (
                               <option key={e.id} value={e.id}>{e.name} ({e.job})</option>
                             ))}
                          </select>
                        </div>
                      ) : null}
                      <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-2">
                        {performanceViewTargetId === currentUser.id ? "Seu Feedback Consolidado (Matriz 360°)" : `Feedback Consolidado: ${employees.find(e => e.id === performanceViewTargetId)?.name || "Colaborador"} (Matriz 360°)`}
                      </h3>
                      <p className="text-xs text-slate-400 mb-6">Média ponderada do ciclo: Autoavaliação (10%), Gestor (40%), Pares (30%), Liderados (20%)</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 dark:bg-indigo-950/10 flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider block">Competência Técnica (TECH)</span>
                            <span className="text-3xl font-display font-extrabold text-slate-900 dark:text-white mt-1 block">
                              {consolidatedScores?.TECH || "Sem notas"}
                            </span>
                          </div>
                          <TrendingUp className="h-10 w-10 text-indigo-400 shrink-0" />
                        </div>

                        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/20 dark:bg-purple-950/10 flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-purple-500 uppercase tracking-wider block">Aderência Cultural (CULTURE)</span>
                            <span className="text-3xl font-display font-extrabold text-slate-900 dark:text-white mt-1 block">
                              {consolidatedScores?.CULTURE || "Sem notas"}
                            </span>
                          </div>
                          <Smile className="h-10 w-10 text-purple-400 shrink-0" />
                        </div>
                      </div>

                      {/* Evaluators comments timeline */}
                      <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Notas e Justificativas Recentes</h4>
                        <div className="space-y-4">
                          {reviewsHistory.map((rev, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs">
                              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-350">
                                <span>Avaliador: {rev.relationship} (Pesos CLT)</span>
                                <span>{new Date(rev.submittedAt).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <div className="mt-2 space-y-1">
                                {rev.scores.map((s, sidx) => (
                                  <div key={sidx}>
                                    <span className="font-bold">{s.competencyId}: {s.rating}/5</span> - <span className="italic text-slate-500">{s.comment}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submission form */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                    <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="text-indigo-500 h-5 w-5" /> Enviar Feedback 360°
                    </h3>
                    
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Avaliar Colaborador</label>
                        <select
                          value={reviewForm.targetId}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, targetId: e.target.value }))}
                          className="w-full text-xs bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none text-slate-850 dark:text-slate-150"
                          required
                        >
                          <option value="">Selecione...</option>
                           {employees
                             .filter(e => {
                               if (currentUser.role === 'EMPLOYEE' || currentUser.role === 'MANAGER') {
                                 return e.departmentId === currentUser.departmentId;
                               }
                               return true;
                             })
                             .map(e => (
                               <option key={e.id} value={e.id}>{e.name} ({e.job})</option>
                             ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Competência</label>
                        <select
                          value={reviewForm.competencyId}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, competencyId: e.target.value }))}
                          className="w-full text-xs bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none text-slate-850 dark:text-slate-150"
                        >
                          <option value="TECH">Habilidade Técnica (TECH)</option>
                          <option value="CULTURE">Comportamento/Cultura (CULTURE)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Nota (1 a 5)</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                          className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg px-3 py-2 outline-none text-slate-850 dark:text-slate-150"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Comentário Explicativo</label>
                        <textarea
                          placeholder="Por que você atribuiu essa nota?"
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                          className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg px-3 py-2 outline-none h-20 text-slate-800 dark:text-slate-200"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2.5 rounded-lg font-bold"
                      >
                        Submeter Avaliação
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB: REDUNDÂNCIA 360 */}
              {activeTab === "redundancy" && (
                <div className="space-y-8">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Repeat className="h-5 w-5 text-indigo-500" /> Análise de Redundância 360°
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Mapeamento de funções críticas, cobertura de competências e riscos de pessoa-chave por departamento.</p>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { label: "Funções Mapeadas", val: "12", color: "from-blue-500 to-indigo-500", note: "de 15 totais" },
                      { label: "Cobertura Média", val: "78%", color: "from-emerald-500 to-teal-500", note: "Meta: 85%" },
                      { label: "Riscos Críticos", val: "3", color: "from-red-500 to-rose-500", note: "Pessoa-chave sem backup" },
                      { label: "Planos de Sucessão", val: "7", color: "from-purple-500 to-pink-500", note: "Ativos" }
                    ].map((card, i) => (
                      <div key={i} className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${card.color}`}></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{card.label}</p>
                        <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">{card.val}</h2>
                        <p className="text-[10px] text-slate-500 mt-2">{card.note}</p>
                      </div>
                    ))}
                  </div>

                  {/* Main content: Risk Map + Coverage */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Risk Matrix */}
                    <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                      <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" /> Mapa de Riscos por Função
                      </h3>
                      <div className="space-y-4">
                        {[
                          { role: "Tech Lead", holder: "Maria Santos", backups: 1, risk: "ALTO", riskColor: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200", coverage: 40 },
                          { role: "Especialista RH", holder: "Carla Pereira", backups: 0, risk: "CRÍTICO", riskColor: "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-300", coverage: 20 },
                          { role: "Desenvolvedor Frontend", holder: "João Silva", backups: 2, risk: "BAIXO", riskColor: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200", coverage: 85 },
                          { role: "DBA / Infra", holder: "Carlos Mendes", backups: 0, risk: "CRÍTICO", riskColor: "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-300", coverage: 15 },
                          { role: "Product Owner", holder: "Fernanda Lima", backups: 1, risk: "MÉDIO", riskColor: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200", coverage: 60 }
                        ].map((item, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-sm text-slate-900 dark:text-white">{item.role}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.riskColor}`}>{item.risk}</span>
                                </div>
                                <p className="text-xs text-slate-500">Titular: {item.holder} · Backups: {item.backups} pessoa(s)</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div className={`h-full rounded-full ${item.coverage >= 70 ? 'bg-emerald-500' : item.coverage >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${item.coverage}%` }}></div>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400">{item.coverage}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Succession Plans */}
                    <div className="space-y-6">
                      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white mb-4">Planos de Sucessão Ativos</h3>
                        <div className="space-y-3">
                          {[
                            { role: "Tech Lead", successor: "João Silva", readiness: "Em Desenvolvimento", readinessColor: "text-amber-500" },
                            { role: "Product Owner", successor: "Ana Costa", readiness: "Pronto", readinessColor: "text-emerald-500" },
                            { role: "Arquiteto Cloud", successor: "Pedro Lima", readiness: "Em Desenvolvimento", readinessColor: "text-amber-500" }
                          ].map((plan, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50">
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{plan.role}</p>
                              <p className="text-[10px] text-slate-400 mt-1">Sucessor: {plan.successor}</p>
                              <p className={`text-[10px] font-bold mt-1 ${plan.readinessColor}`}>{plan.readiness}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Competency Gaps */}
                      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" /> Gaps de Competência
                        </h3>
                        <div className="space-y-3">
                          {[
                            { skill: "Kubernetes / DevOps", gap: "Sem cobertura interna", severity: "Crítico" },
                            { skill: "Data Engineering", gap: "1 pessoa apenas", severity: "Alto" },
                            { skill: "Segurança da Informação", gap: "Competência terceirizada", severity: "Médio" }
                          ].map((gap, idx) => (
                            <div key={idx} className="p-3 rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{gap.skill}</span>
                                <span className="text-[10px] font-bold text-red-500">{gap.severity}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">{gap.gap}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CLIMATE SURVEY INPUT */}
              {activeTab === "climate" && (
                <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6">
                  <div className="text-center space-y-2">
                    <div className="h-12 w-12 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md">
                      <Smile className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-display font-extrabold text-slate-950 dark:text-white">Pesquisa de Pulso Anônima</h2>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">Sua opinião é 100% confidencial. O banco de dados dissocia sua identidade para garantir total anonimato.</p>
                  </div>

                  {surveySubmitted ? (
                    <div className="p-6 rounded-xl border border-emerald-200 bg-emerald-50/20 text-emerald-800 dark:text-emerald-300 text-center font-medium">
                      Obrigado! Sua resposta foi coletada de forma totalmente anônima.
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitClimate} className="space-y-6 pt-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Qual a probabilidade de recomendar a empresa como local de trabalho? (eNPS: 0 a 10)</label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={climateForm.enpsScore}
                          onChange={(e) => setClimateForm(prev => ({ ...prev, enpsScore: Number(e.target.value) }))}
                          className="w-full accent-indigo-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-1">
                          <span>0 - Extremamente Improvável (Detrator)</span>
                          <span className="text-indigo-600 font-bold text-sm bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">{climateForm.enpsScore}</span>
                          <span>10 - Altamente Recomendável (Promotor)</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Como avalia seu sentimento e clima no time essa semana? (1 a 5)</label>
                        <div className="flex gap-2 justify-center">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setClimateForm(prev => ({ ...prev, sentimentRating: rating }))}
                              className={`h-10 w-10 rounded-full font-bold transition-all text-sm border ${
                                climateForm.sentimentRating === rating
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                  : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              {rating}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-md text-sm transition-all"
                      >
                        Enviar Resposta Anonimamente
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 6: PAYROLL / DEPARTAMENTO PESSOAL */}
              {activeTab === "payroll" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Vacations block */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-4">
                          {currentUser.role === 'EMPLOYEE' && "Minhas Solicitações de Férias"}
                          {currentUser.role === 'MANAGER' && "Calendário de Férias da Equipe (Tecnologia)"}
                          {['HR', 'ADMIN'].includes(currentUser.role) && "Calendário & Redundância de Férias Geral"}
                        </h3>
                        
                        <div className="space-y-4">
                          {vacations
                            .filter(vac => {
                              if (currentUser.role === 'EMPLOYEE') {
                                return vac.employeeId === currentUser.id;
                              }
                              if (currentUser.role === 'MANAGER') {
                                const emp = employees.find(e => e.id === vac.employeeId);
                                return emp && emp.departmentId === currentUser.departmentId;
                              }
                              return true;
                            })
                            .map(vac => {
                              const empName = employees.find(e => e.id === vac.employeeId)?.name || `Colaborador #${vac.employeeId}`;
                              return (
                                <div key={vac.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex justify-between items-center text-xs">
                                  <div>
                                    <span className="font-semibold block text-slate-800 dark:text-slate-200">{empName}</span>
                                    <span className="text-slate-400 block mt-1">Período: {new Date(vac.startDate).toLocaleDateString('pt-BR')} até {new Date(vac.endDate).toLocaleDateString('pt-BR')}</span>
                                  </div>
                                  <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full font-bold">
                                    {vac.status}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    {/* Request vacation form */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                      <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar className="text-indigo-500 h-5 w-5" /> Solicitar Férias
                      </h3>
                      
                      {vacationLimitDate && (
                        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/20 text-amber-800 dark:text-amber-300 text-[10px] leading-relaxed">
                          <strong>Aviso Legislativo (CLT):</strong> Limite do período concessivo (vence em: {new Date(vacationLimitDate).toLocaleDateString('pt-BR')}). As férias devem ser gozadas antes deste prazo para evitar penalizações dobradas.
                        </div>
                      )}

                      <form onSubmit={handleSubmitVacation} className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 block mb-1">Data Início</label>
                          <input
                            type="date"
                            value={vacationForm.startDate}
                            onChange={(e) => setVacationForm(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg px-3 py-2.5 outline-none text-slate-800 dark:text-slate-200"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-500 block mb-1">Data Término</label>
                          <input
                            type="date"
                            value={vacationForm.endDate}
                            onChange={(e) => setVacationForm(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg px-3 py-2.5 outline-none text-slate-800 dark:text-slate-200"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-500 block mb-1">Motivo / Observações</label>
                          <input
                            type="text"
                            placeholder="Ex: Férias acumuladas"
                            value={vacationForm.reason}
                            onChange={(e) => setVacationForm(prev => ({ ...prev, reason: e.target.value }))}
                            className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg px-3 py-2.5 outline-none text-slate-800 dark:text-slate-200"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2.5 rounded-lg font-bold"
                        >
                          Confirmar Solicitação
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* DP Audit and CNAB Export (visible to HR/ADMIN) */}
                  {(currentUser.role === 'HR' || currentUser.role === 'ADMIN') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-200 dark:border-slate-800">
                      {/* Audit */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                          <AlertTriangle className="text-red-500 h-5 w-5" /> Auditoria de Inconsistências de Folha
                        </h3>
                        <div className="space-y-3">
                          {payrollAudit.length > 0 ? (
                            payrollAudit.map((item, idx) => (
                              <div key={idx} className="p-3 rounded-lg border border-red-200 bg-red-50/30 text-xs text-red-700 dark:text-red-400">
                                <strong>Colaborador #{item.employeeId}:</strong> {item.issue}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400">Nenhuma inconsistência de folha encontrada.</p>
                          )}
                        </div>
                      </div>

                      {/* CNAB */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                        <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Download className="text-indigo-500 h-5 w-5" /> Exportação de Remessa CNAB
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Gere o arquivo CNAB estruturado para processamento bancário da folha de pagamento de todos os funcionários ativos.
                        </p>
                        <button
                          onClick={handleCNABDownload}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2.5 rounded-lg font-bold flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" /> Gerar & Baixar CNAB
                        </button>
                        {cnabPreview && (
                          <div className="mt-4">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Previsualização do Arquivo</span>
                            <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-mono leading-normal text-slate-600 dark:text-slate-350 overflow-x-auto">
                              {cnabPreview}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
