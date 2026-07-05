import { describe, it, expect } from 'vitest';
import { calculateVacationLimitDate, hasOverlappingVacation } from '../src/modules/payroll';
import { Employee, VacationRequest } from '../src/types';

describe('Module/PayrollCompliance', () => {
  it('should calculate vacation limit date correctly (2 years minus 1 day)', () => {
    const hireDate = '2020-06-01T00:00:00.000Z';
    const limitDate = calculateVacationLimitDate(hireDate);
    // Limit date should be 2022-05-31
    expect(limitDate.toISOString().startsWith('2022-05-31')).toBe(true);
  });

  it('should detect and block overlapping vacations for employees in the same department', () => {
    const allEmployees: Employee[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@orbitatech.com',
        role: 'EMPLOYEE',
        departmentId: 'DEP_TECH',
        hireDate: '2020-06-01T00:00:00.000Z',
        status: 'ACTIVE',
        careerPathId: 'PATH_DEV',
        salaryTier: 'TIER_1',
        job: 'Dev',
        phone: '5551234',
        image: ''
      },
      {
        id: '2',
        name: 'Roberto Souza',
        email: 'roberto@orbitatech.com',
        role: 'EMPLOYEE',
        departmentId: 'DEP_TECH',
        hireDate: '2020-06-01T00:00:00.000Z',
        status: 'ACTIVE',
        careerPathId: 'PATH_DEV',
        salaryTier: 'TIER_1',
        job: 'Dev',
        phone: '5551234',
        image: ''
      },
      {
        id: '3',
        name: 'Giovana Costa',
        email: 'giovana@orbitatech.com',
        role: 'EMPLOYEE',
        departmentId: 'DEP_DESIGN', // Different department
        hireDate: '2020-06-01T00:00:00.000Z',
        status: 'ACTIVE',
        careerPathId: 'PATH_DESIGN',
        salaryTier: 'TIER_1',
        job: 'Designer',
        phone: '5551234',
        image: ''
      }
    ];

    const approvedRequests: VacationRequest[] = [
      {
        id: 'VAC_1',
        employeeId: '1',
        startDate: '2026-07-01',
        endDate: '2026-07-15',
        status: 'APPROVED'
      }
    ];

    // Case 1: Overlapping request from same department (Roberto) -> Should return true (blocked)
    const overlappingRequest = {
      employeeId: '2',
      startDate: '2026-07-10',
      endDate: '2026-07-20'
    };
    expect(hasOverlappingVacation(overlappingRequest, approvedRequests, allEmployees)).toBe(true);

    // Case 2: Non-overlapping request from same department -> Should return false (allowed)
    const nonOverlappingRequest = {
      employeeId: '2',
      startDate: '2026-07-16',
      endDate: '2026-07-30'
    };
    expect(hasOverlappingVacation(nonOverlappingRequest, approvedRequests, allEmployees)).toBe(false);

    // Case 3: Overlapping request from DIFFERENT department (Giovana) -> Should return false (allowed)
    const diffDeptRequest = {
      employeeId: '3',
      startDate: '2026-07-05',
      endDate: '2026-07-12'
    };
    expect(hasOverlappingVacation(diffDeptRequest, approvedRequests, allEmployees)).toBe(false);
  });
});
