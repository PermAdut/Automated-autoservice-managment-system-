import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  employeeQualifications,
  employees,
  services,
  servicesOrders,
  workTypes,
} from '../database/schema';
import { and, eq } from 'drizzle-orm';
import { QualificationItemDto } from './Dto/set-qualifications.dto';

export interface EmployeeQualificationResponse {
  id: string;
  workTypeId: string;
  workTypeName: string;
  level: number;
}

@Injectable()
export class EmployeeQualificationService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getWorkTypes() {
    const rows = await this.databaseService.db
      .select({
        id: workTypes.id,
        name: workTypes.name,
        description: workTypes.description,
      })
      .from(workTypes)
      .orderBy(workTypes.name);

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description ?? '',
    }));
  }

  async getEmployeeQualifications(
    employeeId: string,
  ): Promise<EmployeeQualificationResponse[]> {
    await this.ensureEmployeeExists(employeeId);

    const rows = await this.databaseService.db
      .select({
        id: employeeQualifications.id,
        workTypeId: employeeQualifications.workTypeId,
        workTypeName: workTypes.name,
        level: employeeQualifications.level,
      })
      .from(employeeQualifications)
      .innerJoin(workTypes, eq(workTypes.id, employeeQualifications.workTypeId))
      .where(eq(employeeQualifications.employeeId, employeeId))
      .orderBy(workTypes.name);

    return rows;
  }

  async setEmployeeQualifications(
    employeeId: string,
    qualifications: QualificationItemDto[],
  ): Promise<EmployeeQualificationResponse[]> {
    await this.ensureEmployeeExists(employeeId);

    const uniqueWorkTypeIds = new Set(
      qualifications.map(item => item.workTypeId),
    );
    if (uniqueWorkTypeIds.size !== qualifications.length) {
      throw new BadRequestException('Duplicate work types in qualifications');
    }

    await this.databaseService.db
      .delete(employeeQualifications)
      .where(eq(employeeQualifications.employeeId, employeeId));

    if (qualifications.length > 0) {
      await this.databaseService.db.insert(employeeQualifications).values(
        qualifications.map(item => ({
          employeeId,
          workTypeId: item.workTypeId,
          level: item.level,
        })),
      );
    }

    return this.getEmployeeQualifications(employeeId);
  }

  async isEmployeeQualifiedForOrder(
    employeeId: string,
    orderId: string,
  ): Promise<boolean> {
    const requirements = await this.getOrderQualificationRequirements(orderId);
    if (requirements.length === 0) {
      return true;
    }

    const employeeLevels = await this.getEmployeeQualificationMap(employeeId);

    return requirements.every(
      req =>
        (employeeLevels.get(req.workTypeId) ?? 0) >= req.requiredLevel,
    );
  }

  async getQualificationMismatch(
    employeeId: string,
    orderId: string,
  ): Promise<string | null> {
    const requirements = await this.getOrderQualificationRequirements(orderId);
    if (requirements.length === 0) {
      return null;
    }

    const employeeLevels = await this.getEmployeeQualificationMap(employeeId);
    const missing = requirements.filter(
      req => (employeeLevels.get(req.workTypeId) ?? 0) < req.requiredLevel,
    );

    if (missing.length === 0) {
      return null;
    }

    const details = missing
      .map(
        req =>
          `${req.workTypeName}: требуется ${req.requiredLevel}, у мастера ${employeeLevels.get(req.workTypeId) ?? 0}`,
      )
      .join('; ');

    return `Мастер не соответствует требованиям заказа (${details})`;
  }

  async findQualifiedEmployeesForOrder(orderId: string): Promise<string[]> {
    const requirements = await this.getOrderQualificationRequirements(orderId);
    if (requirements.length === 0) {
      const allEmployees = await this.databaseService.db
        .select({ id: employees.id })
        .from(employees);
      return allEmployees.map(emp => emp.id);
    }

    const allQualifications = await this.databaseService.db
      .select({
        employeeId: employeeQualifications.employeeId,
        workTypeId: employeeQualifications.workTypeId,
        level: employeeQualifications.level,
      })
      .from(employeeQualifications);

    const byEmployee = new Map<string, Map<string, number>>();
    for (const row of allQualifications) {
      if (!byEmployee.has(row.employeeId)) {
        byEmployee.set(row.employeeId, new Map());
      }
      byEmployee.get(row.employeeId)!.set(row.workTypeId, row.level);
    }

    const qualified: string[] = [];
    for (const [employeeId, levels] of byEmployee.entries()) {
      const ok = requirements.every(
        req => (levels.get(req.workTypeId) ?? 0) >= req.requiredLevel,
      );
      if (ok) {
        qualified.push(employeeId);
      }
    }

    return qualified;
  }

  private async getOrderQualificationRequirements(orderId: string) {
    const rows = await this.databaseService.db
      .select({
        workTypeId: services.workTypeId,
        requiredLevel: services.requiredQualificationLevel,
        workTypeName: workTypes.name,
      })
      .from(servicesOrders)
      .innerJoin(services, eq(services.id, servicesOrders.servicesId))
      .leftJoin(workTypes, eq(workTypes.id, services.workTypeId))
      .where(eq(servicesOrders.orderId, orderId));

    const requirements = new Map<
      string,
      { workTypeId: string; requiredLevel: number; workTypeName: string }
    >();

    for (const row of rows) {
      if (!row.workTypeId) {
        continue;
      }

      const existing = requirements.get(row.workTypeId);
      const requiredLevel = row.requiredLevel ?? 1;
      if (!existing || requiredLevel > existing.requiredLevel) {
        requirements.set(row.workTypeId, {
          workTypeId: row.workTypeId,
          requiredLevel,
          workTypeName: row.workTypeName ?? 'Неизвестный вид работ',
        });
      }
    }

    return Array.from(requirements.values());
  }

  private async getEmployeeQualificationMap(employeeId: string) {
    const rows = await this.databaseService.db
      .select({
        workTypeId: employeeQualifications.workTypeId,
        level: employeeQualifications.level,
      })
      .from(employeeQualifications)
      .where(eq(employeeQualifications.employeeId, employeeId));

    return new Map(rows.map(row => [row.workTypeId, row.level]));
  }

  private async ensureEmployeeExists(employeeId: string) {
    const [employee] = await this.databaseService.db
      .select({ id: employees.id })
      .from(employees)
      .where(eq(employees.id, employeeId))
      .limit(1);

    if (!employee) {
      throw new NotFoundException(`Employee with id ${employeeId} not found`);
    }
  }
}
