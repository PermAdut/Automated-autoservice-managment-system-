import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserRaw } from './Dto/UserRaw';
import { plainToInstance } from 'class-transformer';
import { UserRequestDto } from './Dto/UserRequestDto';
import * as bcrypt from 'bcrypt';
import {
  Passport,
  Role,
  User,
  Order,
  Car,
  Review,
  Subscription,
} from './schemas/User';
import { UserResponseDto } from './Dto/UserResponseDto';
import { UpdateUserDto } from './Dto/UpdateUserDto';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAllRaw(): Promise<UserRaw[]> {
    const users = await this.databaseService.query('SELECT * FROM "Users"');
    return plainToInstance(UserRaw, users, { excludeExtraneousValues: true });
  }

  async findByIdRaw(id: string): Promise<UserRaw> {
    try {
      const user = await this.databaseService.query(
        `SELECT * FROM "Users" WHERE id = $1`,
        [id],
      );
      if (user.length === 0) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      console.log(`found user: ${user[0].name as string}`);
      return plainToInstance(UserRaw, user[0], {
        excludeExtraneousValues: true,
      });
    } catch {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async createUser(userBody: UserRequestDto): Promise<UserRaw> {
    try {
      const existingUser = await this.databaseService.query(
        `SELECT * FROM "Users" WHERE login = $1 OR email = $2 OR phone = $3`,
        [userBody.login, userBody.email, userBody.phone],
      );

      if (existingUser.length > 0) {
        const fields: string[] = [];
        if (existingUser[0].login === userBody.login) fields.push('login');
        if (existingUser[0].email === userBody.email) fields.push('email');
        if (existingUser[0].phone === userBody.phone) fields.push('phone');

        throw new BadRequestException({
          message: `User with this ${fields.join(', ')} already exists`,
          fields: fields,
        });
      }
      const passHash: string = await bcrypt.hash(userBody.password, 10);
      const client = await this.databaseService.getClient();
      try {
        await client.query('BEGIN');
        const user = (
          await client.query(
            `INSERT INTO "Users" (login, name, "surName", email, phone, "passwordHash") 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
              userBody.login,
              userBody.name,
              userBody.surName,
              userBody.email,
              userBody.phone,
              passHash,
            ],
          )
        ).rows[0] as User;
        await client.query(
          `INSERT INTO "Passport" ("userId", "identityNumber", nationality, "birthDate", gender, "expirationDate")
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            user.id,
            userBody.passportIdentityNumber,
            userBody.passportNationality,
            userBody.passportBirthDate,
            userBody.passportGender,
            userBody.passportExpirationDate,
          ],
        );
        await client.query('COMMIT');
        console.log(`created user: ${user.name}`);
        return user[0];
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error creating user',
        error: error.message,
        details: error.details,
      });
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const user = await this.findByIdRaw(id);
      const client = await this.databaseService.getClient();
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      try {
        await client.query('BEGIN');
        await this.databaseService.query(
          `DELETE FROM "Passport" WHERE "userId" = $1`,
          [id],
        );
        await this.databaseService.query(
          `DELETE FROM "Orders" WHERE "userId" = $1`,
          [id],
        );
        await this.databaseService.query(
          `DELETE FROM "Cars" WHERE "userId" = $1`,
          [id],
        );
        await this.databaseService.query(
          `DELETE FROM "Reviews" WHERE "userId" = $1`,
          [id],
        );
        await this.databaseService.query(
          `DELETE FROM "Subscriptions" WHERE "userId" = $1`,
          [id],
        );
        await this.databaseService.query(`DELETE FROM "Users" WHERE id = $1`, [
          id,
        ]);
        await client.query('COMMIT');
        console.log(`deleted user: ${user.name}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users: User[] = (await this.databaseService.query(
      'SELECT * FROM "Users"',
    )) as unknown as User[];
    const roles: Role[] = (await this.databaseService.query(
      'SELECT * FROM "Role"',
    )) as unknown as Role[];
    const userResponse: UserResponseDto[] = [];

    await Promise.all(
      users.map(async (user) => {
        const role = roles.find((role) => role.id === user.roleId);
        const passport = await this.getUserPassport(user.id);
        const orders = await this.getUserOrders(user.id);
        const cars = await this.getUserCars(user.id);
        const reviews = await this.getUserReviews(user.id);
        const subscriptions = await this.getUserSubscriptions(user.id);
        userResponse.push({
          id: user.id,
          name: user.name,
          surName: user.surName,
          email: user.email,
          phone: user.phone,
          role: role!.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          passport: passport,
          orders: orders,
          cars: cars,
          reviews: reviews,
          subscriptions: subscriptions,
        });
      }),
    );
    console.log(`found users: ${userResponse.length}`);
    return userResponse;
  }

  async findById(id: string): Promise<UserResponseDto> {
    try {
      const userResult = await this.databaseService.query(
        `
        SELECT 
          u.id,
          u.login,
          u.name,
          u."surName",
          u.email,
          u.phone,
          u."createdAt",
          u."updatedAt",
          json_build_object('id', r.id, 'name', r.name) as role,
          json_build_object(
            'identityNumber', p."identityNumber",
            'nationality', p.nationality,
            'birthDate', p."birthDate",
            'gender', p.gender,
            'expiriationDate', p."expirationDate"
          ) as passport,
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'subscriptionDescription', s."subscriptionDescription",
                'subscriptionName', s."subscriptonName",
                'dateStart', s."dateStart",
                'dateEnd', s."dateEnd"
              )
            ) FROM public."Subscriptions" s WHERE s."userId" = u.id),
            '[]'
          ) as subscriptions,
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'description', rev.description,
                'rate', rev.rate,
                'createdAt', rev."createdAt",
                'updatedAt', rev."updatedAt",
                'deletedAt', rev."deletedAt"
              )
            ) FROM public."Reviews" rev WHERE rev."userId" = u.id),
            '[]'
          ) as reviews,
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'name', c.name,
                'information', c.information,
                'year', c.year,
                'vin', c.vin,
                'licensePlate', c."licensePlate"
              )
            ) FROM public."Cars" c WHERE c."userId" = u.id),
            '[]'
          ) as cars,
          COALESCE(
            (SELECT json_agg(
              json_build_object(
                'id', o.id,
                'status', o.status,
                'createdAt', o."createdAt",
                'updateAt', o."updatedAt",
                'completedAt', o."completedAt"
              )
            ) FROM public."Orders" o WHERE o."userId" = u.id),
            '[]'
          ) as orders
        FROM public."Users" u
        LEFT JOIN public."Role" r ON u."roleId" = r.id
        LEFT JOIN public."Passport" p ON u.id = p."userId"
        WHERE u.id = $1
        `,
        [id],
      );

      if (!userResult || userResult.length === 0) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      const user = userResult[0];
      console.log(`Found detailed user: ${user.name as string}`);

      return plainToInstance(
        UserResponseDto,
        {
          id: user.id,
          role: user.role,
          login: user.login,
          name: user.name,
          surName: user.surName,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          passport: user.passport ? user.passport : undefined,
          subscriptions: user.subscriptions,
          reviews: user.reviews,
          cars: user.cars,
          orders: user.orders,
        },
        {
          excludeExtraneousValues: true,
        },
      );
    } catch {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async getRoleById(id: number): Promise<Role> {
    const role = (await this.databaseService.query(
      `SELECT * FROM "Role" WHERE id = $1`,
      [id],
    )) as unknown as Role[];
    return role[0];
  }

  async updateUser(
    id: string,
    userBody: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      const userCheck = (await this.databaseService.query(
        `SELECT * FROM "Users" WHERE id = $1`,
        [id],
      )) as unknown as User[];
      if (userCheck.length === 0) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      const passHash: string = await bcrypt.hash(userBody.password, 10);
      if (passHash !== userCheck[0].passwordHash) {
        throw new BadRequestException({
          message: 'Invalid password',
        });
      }
      const user = await this.databaseService.query(
        `UPDATE "Users" SET name = $1, surName = $2, email = $3, phone = $4, "passwordHash" = $5 WHERE id = $6 RETURNING *`,
        [
          userBody.name ?? userCheck[0].name,
          userBody.surName ?? userCheck[0].surName,
          userBody.email ?? userCheck[0].email,
          userBody.phone ?? userCheck[0].phone,
          passHash ?? userCheck[0].passwordHash,
          id,
        ],
      );
      console.log(`updated user: ${user[0].name as string}`);
      return plainToInstance(UserResponseDto, user[0], {
        excludeExtraneousValues: true,
      });
    } catch {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async getUserPassport(id: number): Promise<Passport> {
    try {
      const passport = (await this.databaseService.query(
        `SELECT * FROM "Passport" WHERE "userId" = $1`,
        [id],
      )) as unknown as Passport[];
      if (passport.length === 0) {
        throw new NotFoundException(`User passport with id ${id} not found`);
      }
      return passport[0];
    } catch {
      throw new NotFoundException(`User passport with id ${id} not found`);
    }
  }

  async getUserOrders(id: number): Promise<Order[]> {
    const orders = (await this.databaseService.query(
      `SELECT * FROM "Orders" WHERE "userId" = $1`,
      [id],
    )) as unknown as Order[];
    return orders;
  }

  async getUserCars(id: number): Promise<Car[]> {
    const cars = (await this.databaseService.query(
      `SELECT * FROM "Cars" WHERE "userId" = $1`,
      [id],
    )) as unknown as Car[];
    return cars;
  }

  async getUserReviews(id: number): Promise<Review[]> {
    const reviews = (await this.databaseService.query(
      `SELECT * FROM "Reviews" WHERE "userId" = $1`,
      [id],
    )) as unknown as Review[];
    return reviews;
  }

  async getUserSubscriptions(id: number): Promise<Subscription[]> {
    const subscriptions = (await this.databaseService.query(
      `SELECT * FROM "Subscriptions" WHERE "userId" = $1`,
      [id],
    )) as unknown as Subscription[];
    return subscriptions;
  }
}
