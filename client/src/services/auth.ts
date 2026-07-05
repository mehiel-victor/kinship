export type UserRole = "EMPLOYEE" | "MANAGER" | "HR" | "ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
};

type WorkspaceCredential = AuthUser & {
  password: string;
  label: string;
  access: string;
};

const AUTH_STORAGE_KEY = "kinship.auth.session";

export const WORKSPACE_CREDENTIALS: WorkspaceCredential[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@orbitatech.com",
    password: "Kinship@2026",
    role: "EMPLOYEE",
    departmentId: "DEP_TECH",
    label: "Colaborador",
    access: "Feedback, clima e férias",
  },
  {
    id: "3",
    name: "Maria Santos",
    email: "maria.santos@orbitatech.com",
    password: "Kinship@2026",
    role: "MANAGER",
    departmentId: "DEP_TECH",
    label: "Gestora técnica",
    access: "Time, vagas, performance e compliance",
  },
  {
    id: "8",
    name: "Carla Pereira",
    email: "carla.pereira@orbitatech.com",
    password: "Kinship@2026",
    role: "HR",
    departmentId: "DEP_HR",
    label: "Recursos Humanos",
    access: "People Ops completo",
  },
  {
    id: "1",
    name: "Administrador Geral",
    email: "admin@orbitatech.com",
    password: "Kinship@2026",
    role: "ADMIN",
    departmentId: "DEP_TECH",
    label: "Admin",
    access: "Visão administrativa geral",
  },
];

export const FALLBACK_AUTH_USER: AuthUser = {
  id: WORKSPACE_CREDENTIALS[0].id,
  name: WORKSPACE_CREDENTIALS[0].name,
  email: WORKSPACE_CREDENTIALS[0].email,
  role: WORKSPACE_CREDENTIALS[0].role,
  departmentId: WORKSPACE_CREDENTIALS[0].departmentId,
};

function toAuthUser(credential: WorkspaceCredential): AuthUser {
  return {
    id: credential.id,
    name: credential.name,
    email: credential.email,
    role: credential.role,
    departmentId: credential.departmentId,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function authenticateWithEmail(email: string, password: string) {
  const credential = WORKSPACE_CREDENTIALS.find(
    (item) => normalizeEmail(item.email) === normalizeEmail(email) && item.password === password,
  );

  return credential ? toAuthUser(credential) : null;
}

export function getStoredAuthUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSession) as Partial<AuthUser>;
    const credential = WORKSPACE_CREDENTIALS.find(
      (item) => normalizeEmail(item.email) === normalizeEmail(String(parsed.email || "")),
    );

    return credential ? toAuthUser(credential) : null;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function storeAuthUser(user: AuthUser) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearAuthUser() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
