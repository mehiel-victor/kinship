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
type LegacyAPIResponse = string &
  unknown[] & {
    [key: string]: unknown;
    consolidated: Record<string, number>;
    document: unknown;
    documents: unknown[];
    employeeStatus: string;
    inconsistencies: unknown[];
    limitDate: string;
    reviews: unknown[];
    tasks: unknown[];
  };

const demoEmployees: DemoEmployee[] = [
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

const demoVacancies: DemoVacancy[] = [...mockVacancies];
const demoReviews: DemoReview[] = [...mockPerformanceReviews.reviews];
const demoVacations: DemoVacation[] = mockVacations.map((vacation, index) => ({
  ...vacation,
  id: `VAC_${index + 1}`,
}));

const onboardingState = new Map<string, { tasks: DemoTask[]; documents: DemoDocument[] }>([
  [
    "12",
    {
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
  ],
]);

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function respond(value: unknown): LegacyAPIResponse {
  return value as LegacyAPIResponse;
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

function ensureOnboarding(employeeId: string) {
  if (!onboardingState.has(employeeId)) {
    onboardingState.set(employeeId, {
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
    });
  }

  return onboardingState.get(employeeId)!;
}

function updateEmployeeStatus(employeeId: string) {
  const onboarding = ensureOnboarding(employeeId);
  const employee = demoEmployees.find((item) => item.id === employeeId);
  if (!employee) return "ACTIVE";

  const completed = onboarding.tasks.every((task) => task.completed);
  const hasDocuments = onboarding.documents.length > 0;
  employee.status = completed && hasDocuments ? "ACTIVE" : "ONBOARDING";
  return employee.status;
}

function getConsolidatedScores(employeeId: string) {
  const reviews = demoReviews.filter((review) => review.employeeId === employeeId);
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

function createReview(body: Record<string, unknown>) {
  const scores = Array.isArray(body.scores) ? (body.scores as DemoScore[]) : [];
  const review: DemoReview = {
    id: `REV_${demoReviews.length + 1}`,
    employeeId: String(body.employeeId || "1"),
    evaluatorId: String(body.evaluatorId || "1"),
    relationship: String(body.relationship || "PEER"),
    cycleId: String(body.cycleId || "CYCLE_2026_Q1"),
    scores,
    submittedAt: new Date().toISOString(),
  };

  demoReviews.unshift(review);
  return review;
}

function createVacancy(body: Record<string, unknown>) {
  const requirements = Array.isArray(body.requirements) ? (body.requirements as string[]) : [];
  const vacancy: DemoVacancy = {
    id: `v${demoVacancies.length + 1}`,
    title: String(body.title || "Nova vaga"),
    description: String(body.description || "Vaga criada no modo demo."),
    departmentId: String(body.departmentId || "DEP_TECH"),
    requirements,
  };

  demoVacancies.unshift(vacancy);
  return vacancy;
}

function createVacation(body: Record<string, unknown>) {
  const vacation: DemoVacation = {
    id: `VAC_${demoVacations.length + 1}`,
    employeeId: String(body.employeeId || "1"),
    startDate: String(body.startDate || "2026-08-01"),
    endDate: String(body.endDate || "2026-08-15"),
    reason: String(body.reason || "Solicitação criada no modo demo"),
    status: "APPROVED",
  };

  demoVacations.unshift(vacation);
  return vacation;
}

function createCNABPreview() {
  const activeEmployees = demoEmployees.filter((employee) => employee.status === "ACTIVE");
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

  if (method === "GET" && path === "/employees") {
    const query = (url.searchParams.get("query") || "").trim().toLowerCase();
    const employees = query
      ? demoEmployees.filter((employee) =>
          [employee.name, employee.email, employee.job].some((value) =>
            value.toLowerCase().includes(query),
          ),
        )
      : demoEmployees;

    return respond(clone(employees));
  }

  const onboardingMatch = path.match(/^\/employees\/([^/]+)\/onboarding(?:\/(check|upload))?$/);
  if (onboardingMatch) {
    const employeeId = onboardingMatch[1];
    const action = onboardingMatch[2];
    const onboarding = ensureOnboarding(employeeId);

    if (method === "POST" && action === "check") {
      const taskId = String(body.taskId || "");
      const completed = Boolean(body.completed);
      onboarding.tasks = onboarding.tasks.map((task) =>
        task.id === taskId ? { ...task, completed } : task,
      );

      return respond(clone({ tasks: onboarding.tasks, employeeStatus: updateEmployeeStatus(employeeId) }));
    }

    if (method === "POST" && action === "upload") {
      const fileName = String(body.fileName || "Documento_Assinado.pdf");
      const document: DemoDocument = {
        id: `doc-${onboarding.documents.length + 1}`,
        fileName,
        signedAt: new Date().toISOString(),
        sha256Hash: crypto.randomUUID().replace(/-/g, "").slice(0, 32),
        auditSignature: `KINSHIP-AUDIT-${crypto.randomUUID().replace(/-/g, "").toUpperCase()}`,
      };
      onboarding.documents.unshift(document);

      return respond(clone({
        document,
        employeeStatus: updateEmployeeStatus(employeeId),
      }));
    }

    if (method === "GET" && !action) {
      return respond(clone(onboarding));
    }
  }

  if (method === "GET" && path === "/analytics") {
    const onboardingCount = demoEmployees.filter((employee) => employee.status === "ONBOARDING").length;
    return respond(clone({
      ...mockAnalytics,
      headcount: demoEmployees.length,
      activeCount: demoEmployees.length - onboardingCount,
      onboardingCount,
    }));
  }

  if (method === "GET" && path === "/talent/candidates") {
    return respond(clone(mockCandidates));
  }

  if (path === "/talent/vacancies") {
    if (method === "POST") {
      return respond(clone(createVacancy(body)));
    }

    return respond(clone(demoVacancies));
  }

  if (method === "GET" && path === "/climate/aggregate") {
    return respond(clone(mockClimateReport));
  }

  if (method === "POST" && path === "/climate/respond") {
    return respond(clone({
      id: crypto.randomUUID(),
      anonymous: true,
      submittedAt: new Date().toISOString(),
    }));
  }

  const reviewMatch = path.match(/^\/performance\/reviews(?:\/([^/]+))?$/);
  if (reviewMatch) {
    if (method === "POST" && !reviewMatch[1]) {
      return respond(clone(createReview(body)));
    }

    const employeeId = reviewMatch[1];
    if (method === "GET" && employeeId) {
      return respond(clone({
        reviews: demoReviews.filter((review) => review.employeeId === employeeId),
        consolidated: getConsolidatedScores(employeeId),
      }));
    }

    if (method === "GET") {
      return respond(clone({
        reviews: demoReviews,
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
      return respond(clone(createVacation(body)));
    }

    return respond(clone(demoVacations));
  }

  if (method === "GET" && path === "/payroll/cnab") {
    return respond(createCNABPreview());
  }

  throw new Error(`Kinship demo endpoint not implemented: ${method} ${path}`);
}
