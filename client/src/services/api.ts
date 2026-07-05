import {
  mockAnalytics,
  mockCandidates,
  mockClimateReport,
  mockEmployees,
  mockPayrollAudit,
  mockPerformanceReviews,
  mockVacationLimit,
  mockVacations,
  mockVacancies,
} from "../mocks/mockData";

type DemoEmployee = (typeof mockEmployees)[number];
type DemoReview = (typeof mockPerformanceReviews.reviews)[number];
type DemoScore = DemoReview["scores"][number];
type DemoVacation = (typeof mockVacations)[number] & { id: string };
type DemoVacancy = (typeof mockVacancies)[number];
type DemoDocument = {
  id: string;
  fileName: string;
  signedAt: string;
  sha256Hash: string;
  auditSignature: string;
};
type DemoTask = {
  id: string;
  title: string;
  dueDate: string;
  phase: string;
  completed: boolean;
};
type DemoActivity = {
  id: string;
  type: "talent" | "performance" | "climate" | "payroll" | "onboarding";
  actorName: string;
  actorRole: string;
  message: string;
  target?: string;
  createdAt: string;
};
type DemoStore = {
  version: number;
  employees: DemoEmployee[];
  vacancies: DemoVacancy[];
  reviews: DemoReview[];
  vacations: DemoVacation[];
  climateReport: typeof mockClimateReport;
  onboardingByEmployeeId: Record<string, { tasks: DemoTask[]; documents: DemoDocument[] }>;
  activityLog: DemoActivity[];
};
type LegacyAPIResponse = string &
  unknown[] & {
    [key: string]: unknown;
    activityLog: unknown[];
    consolidated: Record<string, number>;
    document: unknown;
    documents: unknown[];
    employeeStatus: string;
    inconsistencies: unknown[];
    limitDate: string;
    reviews: unknown[];
    tasks: unknown[];
  };

const STORE_KEY = "kinship.demo.store.v2";
const STORE_VERSION = 2;
const MAX_ACTIVITY_ITEMS = 32;

const seedEmployees: DemoEmployee[] = [
  ...mockEmployees,
  {
    id: "12",
    name: "Rafael Almeida",
    email: "rafael.almeida@kinship.demo",
    image: "https://i.pravatar.cc/150?img=12",
    job: "Product Designer",
    status: "ONBOARDING",
    phone: "(11) 93456-7890",
    hireDate: "2026-06-17",
    departmentId: "DEP_TECH",
  },
];

const seedOnboarding: DemoStore["onboardingByEmployeeId"] = {
  "12": {
    tasks: [
      {
        id: "task-30",
        title: "Configurar acessos de produto e design system",
        dueDate: "2026-07-10",
        phase: "30 dias",
        completed: true,
      },
      {
        id: "task-60",
        title: "Concluir trilha LGPD e segurança de dados",
        dueDate: "2026-08-14",
        phase: "60 dias",
        completed: false,
      },
      {
        id: "task-90",
        title: "Apresentar primeiro diagnóstico de experiência",
        dueDate: "2026-09-14",
        phase: "90 dias",
        completed: false,
      },
    ],
    documents: [
      {
        id: "doc-1",
        fileName: "Contrato_Admissao_Rafael.pdf",
        signedAt: "2026-06-18T14:30:00.000Z",
        sha256Hash: "9f86d081884c7d659a2feaa0c55ad015",
        auditSignature: "KINSHIP-AUDIT-20260618-143000-RAFAEL",
      },
    ],
  },
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function respond(value: unknown): LegacyAPIResponse {
  return value as LegacyAPIResponse;
}

function createInitialStore(): DemoStore {
  return {
    version: STORE_VERSION,
    employees: clone(seedEmployees),
    vacancies: clone(mockVacancies),
    reviews: clone(mockPerformanceReviews.reviews),
    vacations: mockVacations.map((vacation, index) => ({
      ...clone(vacation),
      id: `VAC_${index + 1}`,
    })),
    climateReport: clone(mockClimateReport),
    onboardingByEmployeeId: clone(seedOnboarding),
    activityLog: [
      {
        id: "ACT_SEED_1",
        type: "onboarding",
        actorName: "Sistema Kinship",
        actorRole: "SYSTEM",
        message: "Demo inicializada com contas conectadas por um store local persistido.",
        target: "LocalStorage",
        createdAt: "2026-07-05T00:00:00.000Z",
      },
    ],
  };
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function saveStore(store: DemoStore) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function isValidStore(value: Partial<DemoStore>) {
  return (
    value.version === STORE_VERSION &&
    Array.isArray(value.employees) &&
    Array.isArray(value.vacancies) &&
    Array.isArray(value.reviews) &&
    Array.isArray(value.vacations) &&
    Array.isArray(value.activityLog) &&
    Boolean(value.onboardingByEmployeeId)
  );
}

function getStore() {
  if (!canUseStorage()) {
    return createInitialStore();
  }

  const rawStore = window.localStorage.getItem(STORE_KEY);
  if (rawStore) {
    try {
      const parsed = JSON.parse(rawStore) as Partial<DemoStore>;
      if (isValidStore(parsed)) {
        return parsed as DemoStore;
      }
    } catch {
      window.localStorage.removeItem(STORE_KEY);
    }
  }

  const store = createInitialStore();
  saveStore(store);
  return store;
}

function persistMutation<T>(mutator: (store: DemoStore) => T) {
  const store = getStore();
  const result = mutator(store);
  saveStore(store);
  return result;
}

function getMethod(options?: RequestInit) {
  return (options?.method || "GET").toUpperCase();
}

function parseEndpoint(endpoint: string) {
  return new URL(endpoint, "https://kinship.demo.local");
}

function readBody(options?: RequestInit): Record<string, unknown> {
  if (!options?.body || typeof options.body !== "string") {
    return {};
  }

  try {
    return JSON.parse(options.body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function getActor(body: Record<string, unknown>) {
  return {
    actorName: String(body.actorName || "Conta demo"),
    actorRole: String(body.actorRole || "DEMO"),
  };
}

function addActivity(
  store: DemoStore,
  body: Record<string, unknown>,
  type: DemoActivity["type"],
  message: string,
  target?: string,
) {
  const actor = getActor(body);
  store.activityLog.unshift({
    id: crypto.randomUUID(),
    type,
    ...actor,
    message,
    target,
    createdAt: new Date().toISOString(),
  });
  store.activityLog = store.activityLog.slice(0, MAX_ACTIVITY_ITEMS);
}

function ensureOnboarding(store: DemoStore, employeeId: string) {
  if (!store.onboardingByEmployeeId[employeeId]) {
    store.onboardingByEmployeeId[employeeId] = {
      tasks: [
        {
          id: `${employeeId}-welcome`,
          title: "Validar documentação admissional",
          dueDate: "2026-07-12",
          phase: "30 dias",
          completed: true,
        },
        {
          id: `${employeeId}-culture`,
          title: "Concluir rituais de cultura e políticas internas",
          dueDate: "2026-08-12",
          phase: "60 dias",
          completed: true,
        },
      ],
      documents: [],
    };
  }

  return store.onboardingByEmployeeId[employeeId];
}

function updateEmployeeStatus(store: DemoStore, employeeId: string) {
  const onboarding = ensureOnboarding(store, employeeId);
  const employee = store.employees.find((item) => item.id === employeeId);
  if (!employee) return "ACTIVE";

  const completed = onboarding.tasks.every((task) => task.completed);
  const hasDocuments = onboarding.documents.length > 0;
  employee.status = completed && hasDocuments ? "ACTIVE" : "ONBOARDING";
  return employee.status;
}

function getConsolidatedScores(store: DemoStore, employeeId: string) {
  const reviews = store.reviews.filter((review) => review.employeeId === employeeId);
  const scores = new Map<string, { total: number; count: number }>();

  reviews.forEach((review) => {
    review.scores.forEach((score) => {
      const current = scores.get(score.competencyId) || { total: 0, count: 0 };
      scores.set(score.competencyId, {
        total: current.total + score.rating,
        count: current.count + 1,
      });
    });
  });

  if (scores.size === 0) {
    return { TECH: 4.0, CULTURE: 4.0 };
  }

  return Object.fromEntries(
    [...scores.entries()].map(([competencyId, item]) => [
      competencyId,
      Number((item.total / item.count).toFixed(1)),
    ]),
  );
}

function createReview(store: DemoStore, body: Record<string, unknown>) {
  const scores = Array.isArray(body.scores) ? (body.scores as DemoScore[]) : [];
  const review: DemoReview = {
    id: `REV_${store.reviews.length + 1}`,
    employeeId: String(body.employeeId || "1"),
    evaluatorId: String(body.evaluatorId || "1"),
    relationship: String(body.relationship || "PEER"),
    cycleId: String(body.cycleId || "CYCLE_2026_Q1"),
    scores,
    submittedAt: new Date().toISOString(),
  };

  store.reviews.unshift(review);
  const target = store.employees.find((employee) => employee.id === review.employeeId)?.name || "colaborador";
  addActivity(store, body, "performance", `enviou feedback 360 para ${target}`, target);
  return review;
}

function createVacancy(store: DemoStore, body: Record<string, unknown>) {
  const requirements = Array.isArray(body.requirements) ? (body.requirements as string[]) : [];
  const vacancy: DemoVacancy = {
    id: `v${store.vacancies.length + 1}`,
    title: String(body.title || "Nova vaga"),
    description: String(body.description || "Vaga criada no modo demo."),
    departmentId: String(body.departmentId || "DEP_TECH"),
    requirements,
  };

  store.vacancies.unshift(vacancy);
  addActivity(store, body, "talent", `criou a vaga ${vacancy.title}`, vacancy.title);
  return vacancy;
}

function createVacation(store: DemoStore, body: Record<string, unknown>) {
  const employeeId = String(body.employeeId || "1");
  const vacation: DemoVacation = {
    id: `VAC_${store.vacations.length + 1}`,
    employeeId,
    startDate: String(body.startDate || "2026-08-01"),
    endDate: String(body.endDate || "2026-08-15"),
    reason: String(body.reason || "Solicitação criada no modo demo"),
    status: "APPROVED",
  };

  store.vacations.unshift(vacation);
  const employee = store.employees.find((item) => item.id === employeeId)?.name || "colaborador";
  addActivity(store, body, "payroll", `solicitou férias para ${employee}`, `${vacation.startDate} - ${vacation.endDate}`);
  return vacation;
}

function registerClimateResponse(store: DemoStore, body: Record<string, unknown>) {
  const departmentId = String(body.departmentId || "DEP_TECH");
  const enpsScore = Number(body.enpsScore || 0);
  const scaledScore = Math.max(0, Math.min(100, enpsScore * 10));
  const aggregate = store.climateReport.aggregates.find((item) => item.departmentId === departmentId);

  if (aggregate && !aggregate.isMasked) {
    aggregate.averageENPS = Math.round(((aggregate.averageENPS || scaledScore) + scaledScore) / 2);
  }

  store.climateReport.globalENPS = Math.round((store.climateReport.globalENPS + scaledScore) / 2);
  addActivity(store, body, "climate", "respondeu a pesquisa de clima anonimamente", departmentId);

  return {
    id: crypto.randomUUID(),
    anonymous: true,
    submittedAt: new Date().toISOString(),
  };
}

function createCNABPreview(store: DemoStore) {
  const activeEmployees = store.employees.filter((employee) => employee.status === "ACTIVE");
  const detailLines = activeEmployees.map((employee, index) => {
    const sequence = String(index + 1).padStart(6, "0");
    const amount = String(820000 + index * 175000).padStart(13, "0");
    return `1${sequence}${employee.name.padEnd(30, " ").slice(0, 30)}${amount}BRL`;
  });

  return [
    "0KINSHIP DEMO        FOLHA PAGAMENTO   20260705",
    ...detailLines,
    `9${String(detailLines.length).padStart(6, "0")}REGISTROS`,
  ].join("\n");
}

export async function fetchAPI(endpoint: string, options?: RequestInit): Promise<LegacyAPIResponse> {
  const method = getMethod(options);
  const url = parseEndpoint(endpoint);
  const path = url.pathname;
  const body = readBody(options);
  const store = getStore();

  if (method === "GET" && path === "/employees") {
    const query = (url.searchParams.get("query") || "").trim().toLowerCase();
    const employees = query
      ? store.employees.filter((employee) =>
          [employee.name, employee.email, employee.job].some((value) =>
            value.toLowerCase().includes(query),
          ),
        )
      : store.employees;

    return respond(clone(employees));
  }

  const onboardingMatch = path.match(/^\/employees\/([^/]+)\/onboarding(?:\/(check|upload))?$/);
  if (onboardingMatch) {
    const employeeId = onboardingMatch[1];
    const action = onboardingMatch[2];

    if (method === "POST" && action === "check") {
      const result = persistMutation((currentStore) => {
        const onboarding = ensureOnboarding(currentStore, employeeId);
        const taskId = String(body.taskId || "");
        const completed = Boolean(body.completed);
        onboarding.tasks = onboarding.tasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task,
        );
        const task = onboarding.tasks.find((item) => item.id === taskId);
        addActivity(
          currentStore,
          body,
          "onboarding",
          `${completed ? "concluiu" : "reabriu"} uma etapa de onboarding`,
          task?.title,
        );

        return { tasks: onboarding.tasks, employeeStatus: updateEmployeeStatus(currentStore, employeeId) };
      });

      return respond(clone(result));
    }

    if (method === "POST" && action === "upload") {
      const result = persistMutation((currentStore) => {
        const onboarding = ensureOnboarding(currentStore, employeeId);
        const fileName = String(body.fileName || "Documento_Assinado.pdf");
        const document: DemoDocument = {
          id: `doc-${onboarding.documents.length + 1}`,
          fileName,
          signedAt: new Date().toISOString(),
          sha256Hash: crypto.randomUUID().replace(/-/g, "").slice(0, 32),
          auditSignature: `KINSHIP-AUDIT-${crypto.randomUUID().replace(/-/g, "").toUpperCase()}`,
        };
        onboarding.documents.unshift(document);
        addActivity(currentStore, body, "onboarding", `assinou o documento ${fileName}`, fileName);

        return {
          document,
          employeeStatus: updateEmployeeStatus(currentStore, employeeId),
        };
      });

      return respond(clone(result));
    }

    if (method === "GET" && !action) {
      return respond(clone(ensureOnboarding(store, employeeId)));
    }
  }

  if (method === "GET" && path === "/analytics") {
    const onboardingCount = store.employees.filter((employee) => employee.status === "ONBOARDING").length;
    return respond(clone({
      ...mockAnalytics,
      headcount: store.employees.length,
      activeCount: store.employees.length - onboardingCount,
      onboardingCount,
      enps: store.climateReport.globalENPS,
    }));
  }

  if (method === "GET" && path === "/activity") {
    return respond(clone(store.activityLog));
  }

  if (method === "GET" && path === "/talent/candidates") {
    return respond(clone(mockCandidates));
  }

  if (path === "/talent/vacancies") {
    if (method === "POST") {
      return respond(clone(persistMutation((currentStore) => createVacancy(currentStore, body))));
    }

    return respond(clone(store.vacancies));
  }

  if (method === "GET" && path === "/climate/aggregate") {
    return respond(clone(store.climateReport));
  }

  if (method === "POST" && path === "/climate/respond") {
    return respond(clone(persistMutation((currentStore) => registerClimateResponse(currentStore, body))));
  }

  const reviewMatch = path.match(/^\/performance\/reviews(?:\/([^/]+))?$/);
  if (reviewMatch) {
    if (method === "POST" && !reviewMatch[1]) {
      return respond(clone(persistMutation((currentStore) => createReview(currentStore, body))));
    }

    const employeeId = reviewMatch[1];
    if (method === "GET" && employeeId) {
      return respond(clone({
        reviews: store.reviews.filter((review) => review.employeeId === employeeId),
        consolidated: getConsolidatedScores(store, employeeId),
      }));
    }

    if (method === "GET") {
      return respond(clone({
        reviews: store.reviews,
        consolidated: mockPerformanceReviews.consolidated,
      }));
    }
  }

  if (method === "GET" && path === "/payroll/audit") {
    return respond(clone(mockPayrollAudit));
  }

  const vacationLimitMatch = path.match(/^\/payroll\/vacations\/limit\/([^/]+)$/);
  if (method === "GET" && vacationLimitMatch) {
    return respond(clone({
      ...mockVacationLimit,
      employeeId: vacationLimitMatch[1],
    }));
  }

  if (path === "/payroll/vacations") {
    if (method === "POST") {
      return respond(clone(persistMutation((currentStore) => createVacation(currentStore, body))));
    }

    return respond(clone(store.vacations));
  }

  if (method === "GET" && path === "/payroll/cnab") {
    return respond(createCNABPreview(store));
  }

  throw new Error(`Kinship demo endpoint not implemented: ${method} ${path}`);
}
