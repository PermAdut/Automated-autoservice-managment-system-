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
  subscriptions,
  reviews,
  users,
} from '../database/schema';
import { eq, and, asc, desc, ilike, or, sql } from 'drizzle-orm';
import { CreateEmployeeDto } from './Dto/create-employee.dto';
import { UpdateEmployeeDto } from './Dto/update-employee.dto';
import { SubscribeEmployeeDto } from './Dto/subscribe-employee.dto';
import { CreateReviewDto } from './Dto/create-review.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getEmployees(
    search?: string,
    sortBy: 'name' | 'salary' | 'hireDate' | 'id' | undefined = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<EmployeeResponse[]> {
    try {
      let query = this.databaseService.db
        .select({
          id: employees.id,
          name: employees.name,
          surName: employees.surName,
          lastName: employees.lastName,
          positionId: employees.positionId,
          hireDate: employees.hireDate,
          salary: employees.salary,
        })
        .from(employees)
        .leftJoin(positions, eq(positions.id, employees.positionId));

      if (search) {
        query = query.where(
          or(
            ilike(employees.name, `%${search}%`),
            ilike(employees.surName, `%${search}%`),
            ilike(employees.lastName ?? sql`''`, `%${search}%`),
            ilike(positions.name, `%${search}%`),
            sql`CAST(${employees.id} AS TEXT) LIKE ${`%${search}%`}`,
            sql`CAST(${employees.salary} AS TEXT) LIKE ${`%${search}%`}`
          )
        ) as any;
      }

      if (sortBy === 'name') {
        query = query.orderBy(
          sortOrder === 'asc' ? asc(employees.name) : desc(employees.name)
        ) as any;
      } else if (sortBy === 'salary') {
        query = query.orderBy(
          sortOrder === 'asc' ? asc(employees.salary) : desc(employees.salary)
        ) as any;
      } else if (sortBy === 'hireDate') {
        query = query.orderBy(
          sortOrder === 'asc'
            ? asc(employees.hireDate)
            : desc(employees.hireDate)
        ) as any;
      } else if (sortBy === 'id') {
        query = query.orderBy(
          sortOrder === 'asc' ? asc(employees.id) : desc(employees.id)
        ) as any;
      }

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
            name: employee.name,
            surName: employee.surName,
            lastName: employee.lastName,
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

  async getEmployeeById(id: number): Promise<EmployeeResponse> {
    const [employee] = await this.databaseService.db
      .select()
      .from(employees)
      .where(eq(employees.id, id))
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
      name: employee?.name ?? '',
      surName: employee?.surName ?? '',
      lastName: employee?.lastName ?? '',
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

  async createEmployee(
    employeeData: CreateEmployeeDto
  ): Promise<EmployeeResponse> {
    const [newEmployee] = await this.databaseService.db
      .insert(employees)
      .values({
        name: employeeData.name,
        surName: employeeData.surName,
        lastName: employeeData.lastName ?? null,
        positionId: employeeData.positionId,
        hireDate: employeeData.hireDate
          ? new Date(employeeData.hireDate)
          : new Date(),
        salary: employeeData.salary.toString(),
      })
      .returning();

    return this.getEmployeeById(newEmployee.id);
  }

  async updateEmployee(
    id: number,
    employeeData: UpdateEmployeeDto
  ): Promise<EmployeeResponse> {
    const updatePayload: Partial<typeof employees.$inferInsert> = {};

    if (employeeData.positionId !== undefined) {
      updatePayload.positionId = employeeData.positionId;
    }

    if (employeeData.name !== undefined) {
      updatePayload.name = employeeData.name;
    }

    if (employeeData.surName !== undefined) {
      updatePayload.surName = employeeData.surName;
    }

    if (employeeData.lastName !== undefined) {
      updatePayload.lastName = employeeData.lastName ?? null;
    }

    if (employeeData.salary !== undefined) {
      updatePayload.salary = employeeData.salary.toString();
    }

    if (employeeData.hireDate !== undefined) {
      updatePayload.hireDate = new Date(employeeData.hireDate);
    }

    if (Object.keys(updatePayload).length === 0) {
      throw new BadRequestException('No employee fields provided for update');
    }

    const [updatedEmployee] = await this.databaseService.db
      .update(employees)
      .set(updatePayload)
      .where(eq(employees.id, id))
      .returning();

    if (!updatedEmployee) {
      throw new NotFoundException(
        `Employee with id ${id.toString()} not found`
      );
    }

    return this.getEmployeeById(id);
  }

  async deleteEmployee(id: number): Promise<void> {
    const employee = await this.databaseService.db
      .select()
      .from(employees)
      .where(eq(employees.id, id))
      .limit(1);

    if (employee.length === 0) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    await this.databaseService.db.delete(employees).where(eq(employees.id, id));
  }

  async getPositions() {
    const positionsList = await this.databaseService.db
      .select()
      .from(positions);
    return positionsList.map(position => ({
      id: position.id,
      name: position.name,
      description: position.description || '',
    }));
  }

  async subscribeToEmployee(
    userId: number,
    subscribeDto: SubscribeEmployeeDto
  ) {
    // Проверяем, существует ли сотрудник
    const [employee] = await this.databaseService.db
      .select()
      .from(employees)
      .where(eq(employees.id, subscribeDto.employeeId))
      .limit(1);

    if (!employee) {
      throw new NotFoundException(
        `Employee with id ${subscribeDto.employeeId} not found`
      );
    }

    // Проверяем, не подписан ли уже пользователь
    const existingSubscription = await this.databaseService.db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.employeeId, subscribeDto.employeeId),
          sql`${subscriptions.dateEnd} > CURRENT_TIMESTAMP`
        )
      )
      .limit(1);

    if (existingSubscription.length > 0) {
      throw new BadRequestException(
        'You are already subscribed to this employee'
      );
    }

    // Создаем подписку на 6 месяцев
    const dateStart = new Date();
    const dateEnd = new Date();
    dateEnd.setMonth(dateEnd.getMonth() + 6);

    const [newSubscription] = await this.databaseService.db
      .insert(subscriptions)
      .values({
        userId,
        employeeId: subscribeDto.employeeId,
        subscriptionName: `Подписка на рабочего`,
        subscriptionDescription: `Подписка на рабочего ${employee.name} ${employee.surName}`,
        dateStart,
        dateEnd,
      })
      .returning();

    return {
      id: newSubscription.id,
      userId: newSubscription.userId,
      employeeId: newSubscription.employeeId,
      subscriptionName: newSubscription.subscriptionName,
      dateStart: newSubscription.dateStart,
      dateEnd: newSubscription.dateEnd,
    };
  }

  async unsubscribeFromEmployee(userId: number, employeeId: number) {
    const result = await this.databaseService.db
      .update(subscriptions)
      .set({ dateEnd: new Date() }) // Завершаем подписку сейчас
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.employeeId, employeeId),
          sql`${subscriptions.dateEnd} > CURRENT_TIMESTAMP`
        )
      )
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('Subscription not found or already expired');
    }

    return { message: 'Successfully unsubscribed' };
  }

  async createReview(userId: number, createReviewDto: CreateReviewDto) {
    // Проверяем, существует ли сотрудник
    const [employee] = await this.databaseService.db
      .select()
      .from(employees)
      .where(eq(employees.id, createReviewDto.employeeId))
      .limit(1);

    if (!employee) {
      throw new NotFoundException(
        `Employee with id ${createReviewDto.employeeId} not found`
      );
    }

    // Проверяем валидность рейтинга
    if (createReviewDto.rate < 1 || createReviewDto.rate > 5) {
      throw new BadRequestException('Rate must be between 1 and 5');
    }

    const [newReview] = await this.databaseService.db
      .insert(reviews)
      .values({
        userId,
        employeeId: createReviewDto.employeeId,
        description: createReviewDto.description || null,
        rate: createReviewDto.rate,
      })
      .returning();

    return {
      id: newReview.id,
      userId: newReview.userId,
      employeeId: newReview.employeeId,
      description: newReview.description,
      rate: newReview.rate,
      createdAt: newReview.createdAt,
    };
  }

  async getEmployeeReviews(employeeId: number) {
    const reviewsList = await this.databaseService.db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        employeeId: reviews.employeeId,
        description: reviews.description,
        rate: reviews.rate,
        createdAt: reviews.createdAt,
        userName: users.name,
        userSurName: users.surName,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(
        and(
          eq(reviews.employeeId, employeeId),
          sql`${reviews.deletedAt} IS NULL`
        )
      )
      .orderBy(desc(reviews.createdAt));

    return reviewsList;
  }

  async getUserSubscription(userId: number, employeeId: number) {
    const [subscription] = await this.databaseService.db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.employeeId, employeeId),
          sql`${subscriptions.dateEnd} > CURRENT_TIMESTAMP`
        )
      )
      .limit(1);

    return subscription || null;
  }
}
