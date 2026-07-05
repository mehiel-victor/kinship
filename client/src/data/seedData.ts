export const baseEmployees = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@kinship.app",
    image: "https://i.pravatar.cc/150?img=1",
    job: "Desenvolvedor Frontend",
    status: "ACTIVE",
    phone: "(11) 98765-4321",
    hireDate: "2022-01-15",
    departmentId: "DEP_TECH"
  },
  {
    id: "3",
    name: "Maria Santos",
    email: "maria.santos@kinship.app",
    image: "https://i.pravatar.cc/150?img=3",
    job: "Tech Lead",
    status: "ACTIVE",
    phone: "(11) 91234-5678",
    hireDate: "2020-06-01",
    departmentId: "DEP_TECH"
  },
  {
    id: "8",
    name: "Carla Pereira",
    email: "carla.pereira@kinship.app",
    image: "https://i.pravatar.cc/150?img=8",
    job: "Especialista RH",
    status: "ACTIVE",
    phone: "(11) 92345-6789",
    hireDate: "2019-09-20",
    departmentId: "DEP_HR"
  }
];

export const seedAnalytics = {
  headcount: 3,
  activeCount: 3,
  onboardingCount: 0,
  enps: 68,
  predictiveInsights: [
    "Turnover estimado em 12% nos próximos 6 meses.",
    "Aumento de 8% na produtividade com treinamentos técnicos."
  ],
  turnoverRate: 12,
  absenteeismRate: 3
};

export const seedCandidates = [
  {
    id: "c1",
    name: "Ana Costa",
    email: "ana.costa@example.com",
    notes: "Experiência em React e Node.",
    skills: ["React", "Node.js", "TypeScript"],
    matchingScore: 92
  },
  {
    id: "c2",
    name: "Pedro Lima",
    email: "pedro.lima@example.com",
    notes: "Focado em backend Java.",
    skills: ["Java", "Spring", "SQL"],
    matchingScore: 78
  }
];

export const seedVacancies = [
  {
    id: "v1",
    title: "Desenvolvedor React Senior",
    description: "Responsável por criar componentes avançados em React.",
    departmentId: "DEP_TECH",
    requirements: ["React", "TypeScript", "CSS"]
  }
];

export const seedClimateReport = {
  globalENPS: 70,
  aggregates: [
    { departmentId: "DEP_TECH", averageENPS: 72, isMasked: false },
    { departmentId: "DEP_HR", averageENPS: 65, isMasked: false },
    { departmentId: "DEP_FIN", averageENPS: 58, isMasked: true }
  ]
};

export const seedPayrollAudit = {
  inconsistencies: [
    { employeeId: "1", issue: "Férias fora do período permitido" },
    { employeeId: "3", issue: "Horas extras não registradas" }
  ]
};

export const seedVacations = [
  {
    employeeId: "1",
    startDate: "2024-07-01",
    endDate: "2024-07-15",
    reason: "Férias",
    status: "APPROVED"
  }
];

export const seedVacationLimit = {
  limitDate: "2025-12-31"
};

export const seedPerformanceReviews = {
  consolidated: {
    TECH: 4.4,
    CULTURE: 4.7
  },
  reviews: [
    {
      id: "REV_1",
      employeeId: "1",
      evaluatorId: "1",
      relationship: "SELF",
      cycleId: "CYCLE_2026_Q1",
      scores: [
        { competencyId: "TECH", rating: 4, comment: "Entreguei as features no prazo." },
        { competencyId: "CULTURE", rating: 5, comment: "Sempre alinhado com a cultura." }
      ],
      submittedAt: "2026-03-10T12:00:00.000Z"
    },
    {
      id: "REV_2",
      employeeId: "1",
      evaluatorId: "3",
      relationship: "MANAGER",
      cycleId: "CYCLE_2026_Q1",
      scores: [
        { competencyId: "TECH", rating: 5, comment: "Código muito limpo e bem arquitetado." },
        { competencyId: "CULTURE", rating: 4, comment: "Prestativo e colaborativo." }
      ],
      submittedAt: "2026-03-12T14:30:00.000Z"
    },
    {
      id: "REV_3",
      employeeId: "1",
      evaluatorId: "2",
      relationship: "PEER",
      cycleId: "CYCLE_2026_Q1",
      scores: [
        { competencyId: "TECH", rating: 4, comment: "Muito bom trabalhar junto." },
        { competencyId: "CULTURE", rating: 5, comment: "Ajuda a equipe sempre." }
      ],
      submittedAt: "2026-03-13T10:00:00.000Z"
    },
    {
      id: "REV_4",
      employeeId: "3",
      evaluatorId: "3",
      relationship: "SELF",
      cycleId: "CYCLE_2026_Q1",
      scores: [
        { competencyId: "TECH", rating: 5, comment: "Liderei o time de frontend com sucesso." },
        { competencyId: "CULTURE", rating: 5, comment: "Foco total na cooperação." }
      ],
      submittedAt: "2026-03-10T12:00:00.000Z"
    },
    {
      id: "REV_5",
      employeeId: "3",
      evaluatorId: "1",
      relationship: "DIRECT_REPORT",
      cycleId: "CYCLE_2026_Q1",
      scores: [
        { competencyId: "TECH", rating: 5, comment: "Excelente mentora e líder." },
        { competencyId: "CULTURE", rating: 4, comment: "Muito atenciosa." }
      ],
      submittedAt: "2026-03-12T15:00:00.000Z"
    },
    {
      id: "REV_6",
      employeeId: "8",
      evaluatorId: "8",
      relationship: "SELF",
      cycleId: "CYCLE_2026_Q1",
      scores: [
        { competencyId: "TECH", rating: 4, comment: "Gerenciei os processos de contratação de forma eficiente." },
        { competencyId: "CULTURE", rating: 4, comment: "Alinhada com a cultura da empresa." }
      ],
      submittedAt: "2026-03-10T12:00:00.000Z"
    }
  ]
};
