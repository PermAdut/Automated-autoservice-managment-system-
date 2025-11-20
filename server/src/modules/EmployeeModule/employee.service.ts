import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EmployeeResponse } from './Dto/employee.response';
import {
  employees,
  positions,
  workSchedules,
  orders,
} from '../database/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class EmployeeService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getEmployees(): Promise<EmployeeResponse[]> {
    try {
      const query = this.databaseService.db
        .select({
          id: employees.id,
          positionId: employees.positionId,
          hireDate: employees.hireDate,
          salary: employees.salary,
        })
        .from(employees);

      const employeesList = await query;

      if (employeesList.length === 0) {
        return [];
      }

      const employeesResponse: EmployeeResponse[] = await Promise.all(
        employeesList.map(async employee => {
          const [position] = await this.databaseService.db
            .select()
            .from(positions)
            .where(eq(positions.id, employee.positionId))
            .limit(1);

          const [schedule] = await this.databaseService.db
            .select()
            .from(workSchedules)
            .where(eq(workSchedules.employeeId, employee.id))
            .limit(1);

          const [currentOrder] = await this.databaseService.db
            .select()
            .from(orders)
            .where(
              and(
                eq(orders.employeeId, employee.id),
                eq(orders.status, 'pending')
              )
            )
            .limit(1);

          return {
            id: employee.id,
            positionId: employee.positionId,
            hireDate: employee.hireDate.toISOString(),
            salary: parseFloat(employee.salary.toString()),
            position: position
              ? {
                  id: position.id,
                  name: position.name,
                  description: position.description,
                }
              : undefined,
            schedule: schedule
              ? {
                  id: schedule.id,
                  employeeId: schedule.employeeId,
                  startTime: schedule.startTime.toISOString(),
                  endTime: schedule.endTime.toISOString(),
                  isAvailable: schedule.isAvailable,
                }
              : undefined,
            orders: currentOrder
              ? {
                  id: currentOrder.id,
                  status: currentOrder.status,
                }
              : undefined,
          };
        })
      );

      return employeesResponse;
    } catch (error: unknown) {
      throw new BadRequestException((error as Error).message);
    }
  }

  async getEmployeeById(id: string): Promise<EmployeeResponse> {
    const [employee] = await this.databaseService.db
      .select()
      .from(employees)
      .where(eq(employees.id, parseInt(id)))
      .limit(1);

    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    const [position] = await this.databaseService.db
      .select()
      .from(positions)
      .where(eq(positions.id, employee.positionId))
      .limit(1);

    const [schedule] = await this.databaseService.db
      .select()
      .from(workSchedules)
      .where(eq(workSchedules.employeeId, employee.id))
      .limit(1);

    const [currentOrder] = await this.databaseService.db
      .select()
      .from(orders)
      .where(
        and(eq(orders.employeeId, employee.id), eq(orders.status, 'pending'))
      )
      .limit(1);

    return {
      id: employee.id,
      hireDate: employee.hireDate.toISOString(),
      salary: parseFloat(employee.salary.toString()),
      position: position
        ? {
            id: position.id,
            name: position.name,
            description: position.description,
          }
        : undefined,
      schedule: schedule
        ? {
            id: schedule.id,
            employeeId: schedule.employeeId,
            startTime: schedule.startTime.toISOString(),
            endTime: schedule.endTime.toISOString(),
            isAvailable: schedule.isAvailable,
          }
        : undefined,
      orders: currentOrder
        ? {
            id: currentOrder.id,
            status: currentOrder.status,
          }
        : undefined,
    };
  }

  async createEmployee(employeeData: any): Promise<EmployeeResponse> {
    const [newEmployee] = await this.databaseService.db
      .insert(employees)
      .values({
        positionId: employeeData.positionId,
        hireDate: employeeData.hireDate || new Date(),
        salary: employeeData.salary,
      })
      .returning();

    return this.getEmployeeById(newEmployee.id.toString());
  }

  async updateEmployee(
    id: string,
    employeeData: any
  ): Promise<EmployeeResponse> {
    const [updatedEmployee] = await this.databaseService.db
      .update(employees)
      .set({
        positionId: employeeData.positionId,
        salary: employeeData.salary,
      })
      .where(eq(employees.id, parseInt(id)))
      .returning();

    if (!updatedEmployee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    return this.getEmployeeById(id);
  }

  async deleteEmployee(id: string): Promise<void> {
    const employee = await this.databaseService.db
      .select()
      .from(employees)
      .where(eq(employees.id, parseInt(id)))
      .limit(1);

    if (employee.length === 0) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    await this.databaseService.db
      .delete(employees)
      .where(eq(employees.id, parseInt(id)));
  }
}
