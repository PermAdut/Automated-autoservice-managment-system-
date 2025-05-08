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
      const user = (await this.databaseService.query(
        `SELECT * FROM "Users" WHERE id = $1`,
        [id],
      )) as unknown as User[];
      if (user.length === 0) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      const role = await this.getRoleById(user[0].roleId);
      console.log(`found detailed user: ${user[0].name}`);
      return plainToInstance(
        UserResponseDto,
        {
          ...user[0],
          role: role.name,
        },
        {
          excludeExtraneousValues: true,
        },
      ) as unknown as UserResponseDto;
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
