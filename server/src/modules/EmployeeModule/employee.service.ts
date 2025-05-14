import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EmployeeResponse } from './Dto/employee.response';
import { PoolClient } from 'pg';
import { Employee, Order, Position, Schedule } from './schemas/employee.types';

@Injectable()
export class EmployeeService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getEmployees(): Promise<EmployeeResponse[]> {
    const client: PoolClient = await this.databaseService.getClient();
    try {
      await client.query('BEGIN');
      const employees = (await client.query(`SELECT * FROM "Employees"`))
        .rows as unknown as Employee[];
      if (employees.length === 0) {
        await client.query('COMMIT');
        return [];
      }
      console.log(employees);
      const employeesResponse: EmployeeResponse[] = await Promise.all(
        employees.map(async (employee) => {
          const position = (
            await client.query(`SELECT * FROM "Position" WHERE id = $1`, [
              employee.positionId,
            ])
          ).rows[0] as unknown as Position;
          const schedule = (
            await client.query(
              `SELECT * FROM "WorkSchedule" WHERE "employeeId" = $1`,
              [employee.id],
            )
          ).rows[0] as unknown as Schedule;
          const orders = (
            await client.query(
              `SELECT * FROM "Orders" WHERE "employeeId" = $1 AND status = 'pending' LIMIT 1`,
              [employee.id],
            )
          ).rows as unknown as Order[];
          const currentOrder = orders[0] ?? undefined;
          return {
            ...employee,
            position,
            schedule,
            orders: currentOrder,
          };
        }),
      );
      await client.query('COMMIT');
      return employeesResponse;
    } catch (error: unknown) {
      throw new BadRequestException((error as Error).message);
    } finally {
      client.release();
    }
  }
}
