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
  branchEmployees,
  branches,
} from '../database/schema';
import { eq, and, asc, desc, ilike, or, sql } from 'drizzle-orm';
import { CreateEmployeeDto } from './Dto/create-employee.dto';
import { UpdateEmployeeDto } from './Dto/update-employee.dto';
import { SubscribeEmployeeDto } from './Dto/subscribe-employee.dto';
import { CreateReviewDto } from './Dto/create-review.dto';
import { EmployeeQualificationService } from './employee-qualification.service';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly qualificationService: EmployeeQualificationService,
  ) {}

  async getEmployees(
    search?: string,
    sortBy: 'name' | 'salary' | 'hireDate' | 'id' | undefined = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<EmployeeResponse[]> {
    try {
      const query = this.databaseService.db
        .select({
          id: employees.id,
          name: employees.name,
          surName: employees.surName,
          lastName: employees.lastName,
          positionId: employees.positionId,
          hireDate: employees.hireDate,
          salary: employees.salary,
          userId: employees.userId,
        })
        .from(employees)
        .leftJoin(positions, eq(positions.id, employees.positionId))
        .$dynamic();

      if (search) {
        query.where(
          or(
            ilike(employees.name, `%${search}%`),
            ilike(employees.surName, `%${search}%`),
            ilike(employees.lastName ?? sql`''`, `%${search}%`),
            ilike(positions.name, `%${search}%`),
            sql`CAST(${employees.id} AS TEXT) LIKE ${`%${search}%`}`,
            sql`CAST(${employees.salary} AS TEXT) LIKE ${`%${search}%`}`
          )
        );
      }

      if (sortBy === 'name') {
        query.orderBy(sortOrder === 'asc' ? asc(employees.name) : desc(employees.name));
      } else if (sortBy === 'salary') {
        query.orderBy(sortOrder === 'asc' ? asc(employees.salary) : desc(employees.salary));
      } else if (sortBy === 'hireDate') {
        query.orderBy(sortOrder === 'asc' ? asc(employees.hireDate) : desc(employees.hireDate));
      } else if (sortBy === 'id') {
        query.orderBy(sortOrder === 'asc' ? asc(employees.id) : desc(employees.id));
      }

      const employeesList = await query;

      if (employeesList.length === 0) {
        return [];
      }

      const employeesResponse: EmployeeResponse[] = await Promise.all(
        employeesList.map(async employee => this.buildEmployeeResponse(employee))
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
      .where(eq(employees.id, id))
      .limit(1);

    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    return this.buildEmployeeResponse(employee);
  }

  private async buildEmployeeResponse(
    employee: Pick<
      typeof employees.$inferSelect,
      | 'id'
      | 'name'
      | 'surName'
      | 'lastName'
      | 'positionId'
      | 'hireDate'
      | 'salary'
      | 'userId'
    >,
  ): Promise<EmployeeResponse> {
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
        and(eq(orders.employeeId, employee.id), eq(orders.status, 'pending')),
      )
      .limit(1);

    let contact: { email?: string | null; phone?: string | null } | undefined;
    if (employee.userId) {
      const [user] = await this.databaseService.db
        .select({ email: users.email, phone: users.phone })
        .from(users)
        .where(eq(users.id, employee.userId))
        .limit(1);
      if (user) {
        contact = { email: user.email, phone: user.phone };
      }
    }

    const [branchRow] = await this.databaseService.db
      .select({
        id: branches.id,
        name: branches.name,
        isPrimary: branchEmployees.isPrimary,
      })
      .from(branchEmployees)
      .innerJoin(branches, eq(branches.id, branchEmployees.branchId))
      .where(eq(branchEmployees.employeeId, employee.id))
      .limit(1);

    const qualifications =
      await this.qualificationService.getEmployeeQualifications(employee.id);

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
      contact,
      branch: branchRow
        ? {
            id: branchRow.id,
            name: branchRow.name,
            isPrimary: branchRow.isPrimary,
          }
        : undefined,
      qualifications,
    };
  }

  async hideReview(reviewId: string) {
    const [review] = await this.databaseService.db
      .update(reviews)
      .set({ deletedAt: new Date() })
      .where(and(eq(reviews.id, reviewId), sql`${reviews.deletedAt} IS NULL`))
      .returning();

    if (!review) {
      throw new NotFoundException(`Review with id ${reviewId} not found`);
    }

    return { id: review.id, hidden: true };
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
    id: string,
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

  async deleteEmployee(id: string): Promise<void> {
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
    userId: string,
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

  async unsubscribeFromEmployee(userId: string, employeeId: string) {
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

  async createReview(userId: string, createReviewDto: CreateReviewDto) {
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

  async getEmployeeReviews(employeeId: string) {
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

  async getUserSubscription(userId: string, employeeId: string) {
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
