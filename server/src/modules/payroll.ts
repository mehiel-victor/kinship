import { Employee, VacationRequest } from '../types';

/**
 * Calculates the limit date for the vacation concession (Período Concessivo).
 * Under Brazilian labor law, the concession period ends 2 years (24 months) after the hire date for the first period,
 * and subsequently 1 year after each acquisition period.
 * For MVP, we calculate: limitDate = hireDate + 2 years.
 * @param hireDate ISO date string or Date
 */
export function calculateVacationLimitDate(hireDate: string | Date): Date {
  const date = new Date(hireDate);
  // Concession limit is 2 years (24 months) from the hire date
  date.setFullYear(date.getFullYear() + 2);
  // To avoid doubling payment, vacation must end before this date.
  // We subtract 1 day to be safe.
  date.setDate(date.getDate() - 1);
  return date;
}

/**
 * Checks if a candidate vacation request overlaps with an already approved vacation of another member of the same department.
 * Block if they overlap and are in the same department.
 */
export function hasOverlappingVacation(
  newRequest: { startDate: string; endDate: string; employeeId: string },
  approvedRequests: VacationRequest[],
  allEmployees: Employee[]
): boolean {
  const requester = allEmployees.find(e => e.id === newRequest.employeeId);
  if (!requester) return false;

  const startNew = new Date(newRequest.startDate);
  const endNew = new Date(newRequest.endDate);

  for (const approved of approvedRequests) {
    if (approved.status !== 'APPROVED') continue;
    if (approved.employeeId === newRequest.employeeId) continue; // Same person doesn't count as "overlapping with colleague"

    const colleague = allEmployees.find(e => e.id === approved.employeeId);
    if (!colleague || colleague.departmentId !== requester.departmentId) continue;

    const startApproved = new Date(approved.startDate);
    const endApproved = new Date(approved.endDate);

    // Check overlap: Start A <= End B AND End A >= Start B
    if (startNew <= endApproved && endNew >= startApproved) {
      return true;
    }
  }

  return false;
}

/**
 * Runs payroll audit and checks for inconsistencies.
 */
export function auditPayroll(employees: Employee[]): Array<{ employeeId: string; issue: string }> {
  const inconsistencies: Array<{ employeeId: string; issue: string }> = [];
  employees.forEach(emp => {
    // Inconsistency: Status active but missing email or phone
    if (emp.status === 'ACTIVE' && (!emp.email || !emp.phone)) {
      inconsistencies.push({ employeeId: emp.id, issue: 'Colaborador ativo sem e-mail ou telefone cadastrado' });
    }
    // Inconsistency: ONBOARDING status but hire date is in the past (> 30 days)
    if (emp.status === 'ONBOARDING') {
      const daysSinceHire = (Date.now() - new Date(emp.hireDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceHire > 30) {
        inconsistencies.push({ employeeId: emp.id, issue: 'Onboarding pendente por mais de 30 dias' });
      }
    }
  });
  return inconsistencies;
}

/**
 * Generates CNAB remessa file content for payroll payments.
 */
export function generateCNABRemittance(employees: Employee[]): string {
  let cnab = "01FOLHAPAGAMENTO" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "\n";
  employees.filter(e => e.status === 'ACTIVE').forEach(emp => {
    cnab += `30${emp.id.padEnd(6, '0')}${emp.name.substring(0, 30).padEnd(30, ' ')}TIER-${emp.salaryTier.padEnd(10, ' ')}\n`;
  });
  cnab += "9" + String(employees.length).padStart(6, '0');
  return cnab;
}
