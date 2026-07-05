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
  UserRoundCheck
} from "lucide-react";
import {
  DEMO_CREDENTIALS,
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
  EMPLOYEE: ["performance", "climate", "payroll"],
  MANAGER: ["dashboard", "employees", "talent", "performance", "redundancy", "climate", "payroll"],
  HR: ["dashboard", "employees", "talent", "performance", "redundancy", "climate", "payroll"],
  ADMIN: ["dashboard", "employees", "talent", "performance", "redundancy", "climate", "payroll"]
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

  // Loading triggers
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Error handling
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        body: JSON.stringify({ taskId, completed: !currentStatus })
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
        body: JSON.stringify({ fileName: uploadingDocName })
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
          requirements: reqsArray
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
          scores: [{ competencyId: reviewForm.competencyId, rating: Number(reviewForm.rating), comment: reviewForm.comment }]
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
          sentimentRating: Number(climateForm.sentimentRating)
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
          reason: vacationForm.reason
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

  const startAuthenticatedSession = (user: AuthUser) => {
    setAuthState({ isAuthenticated: true, user });
    storeAuthUser(user);
    setActiveTab(getDefaultTab(user.role));
    setErrorMessage(null);
    setLoginError(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCredentialFill = (email: string, password: string) => {
    setLoginForm({ email, password });
    setLoginError(null);
  };

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const user = authenticateWithEmail(loginForm.email, loginForm.password);
    if (!user) {
      setLoginError("Email ou senha inválidos para a demo.");
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
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans">
        <main className="min-h-screen grid lg:grid-cols-[minmax(0,0.96fr)_minmax(27rem,0.74fr)]">
          <section className="relative overflow-hidden px-6 py-8 sm:px-10 lg:px-14 lg:py-12 flex flex-col justify-between">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_18%_20%,rgba(99,102,241,0.34),transparent_32%),radial-gradient(circle_at_78%_8%,rgba(20,184,166,0.18),transparent_30%),linear-gradient(135deg,rgba(15,23,42,1),rgba(2,6,23,1))]" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <img
                  src="/kinship_logo.png"
                  alt="Kinship"
                  className="h-12 w-12 rounded-2xl object-cover object-top border border-white/10 shadow-2xl"
                />
                <div>
                  <span className="block font-display text-2xl font-extrabold tracking-tight">Kinship</span>
                  <span className="text-sm text-slate-300">People & Culture Platform</span>
                </div>
              </div>

              <div className="mt-24 max-w-3xl">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-300/25 bg-indigo-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-100">
                  <ShieldCheck className="h-4 w-4" />
                  Acesso RBAC por email
                </p>
                <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                  People Ops com login real de demo.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Cada conta abre uma visão diferente do produto: colaborador, gestor, RH ou administrador. A sessão fica salva no navegador e os fluxos seguem com dados mockados seguros.
                </p>
              </div>
            </div>

            <div className="relative mt-12 grid gap-3 sm:grid-cols-3">
              {[
                { value: "4", label: "contas demo" },
                { value: "7", label: "módulos protegidos" },
                { value: "0", label: "backend obrigatório" },
              ].map((item) => (
                <div key={item.label} className="border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                  <strong className="block font-display text-3xl font-black">{item.value}</strong>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10 text-slate-950 dark:bg-slate-900 dark:text-white sm:px-10">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                  <UserRoundCheck className="h-5 w-5" />
                </span>
                <h2 className="font-display text-3xl font-extrabold tracking-tight">Entrar no Kinship</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Use uma conta demo por email para acessar as permissões do perfil.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Email</span>
                  <span className="relative block">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(event) => setLoginForm(prev => ({ ...prev, email: event.target.value }))}
                      autoComplete="email"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-950"
                      placeholder="email@kinship.demo"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Senha</span>
                  <span className="relative block">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(event) => setLoginForm(prev => ({ ...prev, password: event.target.value }))}
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-950"
                      placeholder="Senha da conta demo"
                    />
                  </span>
                </label>

                {loginError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-950"
                >
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Contas demo</span>
                  <span className="text-[11px] font-semibold text-slate-400">senha no README</span>
                </div>
                <div className="grid gap-2">
                  {DEMO_CREDENTIALS.map((credential) => (
                    <button
                      key={credential.email}
                      type="button"
                      onClick={() => handleCredentialFill(credential.email, credential.password)}
                      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-slate-900 dark:text-white">{credential.label}</span>
                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{credential.email}</span>
                        <span className="mt-1 block text-[11px] font-medium text-slate-400">{credential.access}</span>
                      </span>
                      <span className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 transition group-hover:border-indigo-300 group-hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400">
                        usar
                      </span>
                    </button>
                  ))}
                </div>
              </div>
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
