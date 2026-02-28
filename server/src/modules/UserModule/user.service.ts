import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserRaw } from './Dto/UserRaw';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from './Dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from './Dto/UserResponseDto';
import { UpdateUserDto } from './Dto/update-user.dto';
import { UpdateProfileDto } from './Dto/update-profile.dto';
import {
  users,
  roles,
  passports,
  orders,
  cars,
  reviews,
  subscriptions,
} from '../database/schema';
import { asc, desc, eq, like, or, inArray } from 'drizzle-orm';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAllRaw(): Promise<UserRaw[]> {
    const usersList = await this.databaseService.db.select().from(users);
    return plainToInstance(UserRaw, usersList, {
      excludeExtraneousValues: true,
    });
  }

  async findByIdRaw(id: string): Promise<UserRaw> {
    const user = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (user.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    console.log(`found user: ${user[0].name}`);
    return plainToInstance(UserRaw, user[0], {
      excludeExtraneousValues: true,
    });
  }

  async createUser(userBody: CreateUserDto): Promise<UserRaw> {
    const conditions = [
      eq(users.login, userBody.login),
      eq(users.email, userBody.email),
    ];

    // Only check phone if it's provided
    if (userBody.phone) {
      conditions.push(eq(users.phone, userBody.phone));
    }

    const existingUser = await this.databaseService.db
      .select()
      .from(users)
      .where(or(...conditions))
      .limit(1);

    if (existingUser.length > 0) {
      const fields: string[] = [];
      if (existingUser[0].login === userBody.login) fields.push('login');
      if (existingUser[0].email === userBody.email) fields.push('email');
      if (userBody.phone && existingUser[0].phone === userBody.phone)
        fields.push('phone');

      throw new BadRequestException({
        message: `User with this ${fields.join(', ')} already exists`,
        fields: fields,
      });
    }

    const passHash: string = await bcrypt.hash(userBody.password, 10);

    // Get customer role ID
    const customerRole = await this.databaseService.db
      .select()
      .from(roles)
      .where(eq(roles.name, 'customer'))
      .limit(1);

    const defaultRoleId = customerRole[0]?.id; // Fallback to first role if customer doesn't exist

    try {
      const result = await this.databaseService.db.transaction(async tx => {
        const [newUser] = await tx
          .insert(users)
          .values({
            login: userBody.login,
            name: userBody.name,
            surName: userBody.surName,
            email: userBody.email,
            phone: userBody.phone,
            passwordHash: passHash,
            roleId: defaultRoleId,
          })
          .returning();

        await tx.insert(passports).values({
          userId: newUser.id,
          identityNumber: userBody.passportIdentityNumber,
          birthDate: new Date(userBody.passportBirthDate),
          gender: userBody.passportGender,
        });

        return newUser;
      });

      console.log(`created user: ${result.name}`);
      return plainToInstance(UserRaw, result, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error creating user',
        error: (error as Error).message,
      });
    }
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (user.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    try {
      await this.databaseService.db.transaction(async tx => {
        await tx.delete(passports).where(eq(passports.userId, id));
        await tx.delete(orders).where(eq(orders.userId, id));
        await tx.delete(cars).where(eq(cars.userId, id));
        await tx.delete(reviews).where(eq(reviews.userId, id));
        await tx.delete(subscriptions).where(eq(subscriptions.userId, id));
        await tx.delete(users).where(eq(users.id, id));
      });

      console.log(`deleted user: ${user[0].name}`);
    } catch {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async findAll(
    search?: string,
    sortBy: 'name' | undefined = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<UserResponseDto[]> {
    let query = this.databaseService.db
      .select({
        id: users.id,
        name: users.name,
        surName: users.surName,
        email: users.email,
        phone: users.phone,
        roleId: users.roleId,
        roleName: roles.name,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id));

    if (search) {
      query = query.where(
        or(
          like(users.name, `%${search}%`),
          like(users.surName, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.phone, `%${search}%`)
        )
      ) as any;
    }

    if (sortBy === 'name') {
      const orderBy = sortOrder === 'desc' ? desc(users.name) : asc(users.name);
      query = query.orderBy(orderBy) as any;
    }

    const usersList = await query;

    const userResponseData = await Promise.all(
      usersList.map(async user => {
        const [passport] = await this.databaseService.db
          .select()
          .from(passports)
          .where(eq(passports.userId, user.id))
          .limit(1);

        const userOrders = await this.databaseService.db
          .select()
          .from(orders)
          .where(eq(orders.userId, user.id));

        const userCars = await this.databaseService.db
          .select()
          .from(cars)
          .where(eq(cars.userId, user.id));

        const userReviews = await this.databaseService.db
          .select()
          .from(reviews)
          .where(eq(reviews.userId, user.id));

        const userSubscriptions = await this.databaseService.db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, user.id));

        return {
          id: user.id,
          name: user.name,
          surName: user.surName,
          email: user.email,
          phone: user.phone,
          role: user.roleName || '',
          createdAt: user.createdAt?.toISOString() || '',
          updatedAt: user.updatedAt?.toISOString() || '',
          passport: passport
            ? {
                identityNumber: passport.identityNumber,
                birthDate: passport.birthDate.toISOString(),
                gender: passport.gender,
              }
            : undefined,
          orders: userOrders.map(o => ({
            id: o.id,
            status: o.status || '',
            createdAt: o.createdAt?.toISOString() || '',
            updateAt: o.updatedAt?.toISOString() || '',
            completedAt: o.completedAt?.toISOString() || '',
          })),
          cars: userCars.map(c => ({
            id: c.id,
            brand: c.brand,
            model: c.model,
            information: c.information || '',
            year: c.year.toString(),
            vin: c.vin,
            licensePlate: c.licensePlate || '',
          })),
          reviews: userReviews.map(r => ({
            id: r.id,
            description: r.description || '',
            rate: r.rate,
            createdAt: r.createdAt?.toISOString() || '',
            updatedAt: r.updatedAt?.toISOString() || '',
            deletedAt: r.deletedAt?.toISOString() || '',
          })),
          subscriptions: userSubscriptions.map(s => ({
            subscriptionDescription: s.subscriptionDescription || '',
            subscriptionName: s.subscriptionName,
            dateStart: s.dateStart.toISOString(),
            dateEnd: s.dateEnd.toISOString(),
          })),
        };
      })
    );

    const userResponse = plainToInstance(UserResponseDto, userResponseData, {
      excludeExtraneousValues: true,
    });

    console.log(`found users: ${userResponse.length}`);
    return userResponse;
  }

  async findById(id: string): Promise<UserResponseDto> {
    const userResult = await this.databaseService.db
      .select({
        id: users.id,
        login: users.login,
        name: users.name,
        surName: users.surName,
        email: users.email,
        phone: users.phone,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        roleId: roles.id,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, id))
      .limit(1);

    if (userResult.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const user = userResult[0];

    const [passport] = await this.databaseService.db
      .select()
      .from(passports)
      .where(eq(passports.userId, user.id))
      .limit(1);

    const userSubscriptions = await this.databaseService.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id));

    const userReviews = await this.databaseService.db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, user.id));

    const userCars = await this.databaseService.db
      .select()
      .from(cars)
      .where(eq(cars.userId, user.id));

    const userOrders = await this.databaseService.db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id));

    console.log(`Found detailed user: ${user.name}`);

    return plainToInstance(
      UserResponseDto,
      {
        id: user.id,
        role: user.roleName || '',
        login: user.login,
        name: user.name,
        surName: user.surName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt?.toISOString() || '',
        updatedAt: user.updatedAt?.toISOString() || '',
        passport: passport
          ? {
              identityNumber: passport.identityNumber,
              birthDate: passport.birthDate.toISOString(),
              gender: passport.gender,
            }
          : undefined,
        subscriptions: userSubscriptions.map(s => ({
          subscriptionDescription: s.subscriptionDescription || '',
          subscriptionName: s.subscriptionName,
          dateStart: s.dateStart.toISOString(),
          dateEnd: s.dateEnd.toISOString(),
        })),
        reviews: userReviews.map(r => ({
          description: r.description || '',
          rate: r.rate,
          createdAt: r.createdAt?.toISOString() || '',
          updatedAt: r.updatedAt?.toISOString() || '',
          deletedAt: r.deletedAt?.toISOString() || '',
        })),
        cars: userCars.map(c => ({
          id: c.id,
          name: `${c.brand} ${c.model}`,
          information: c.information || '',
          year: c.year.toString(),
          vin: c.vin,
          licensePlate: c.licensePlate || '',
        })),
        orders: userOrders.map(o => ({
          id: o.id,
          status: o.status || '',
          createdAt: o.createdAt?.toISOString() || '',
          updateAt: o.updatedAt?.toISOString() || '',
          completedAt: o.completedAt?.toISOString() || '',
        })),
      },
      {
        excludeExtraneousValues: true,
      }
    );
  }

  async getRoleById(id: string): Promise<{ id: string; name: string }> {
    const role = await this.databaseService.db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);
    return role[0];
  }

  async getRoles(): Promise<{ id: string; name: string }[]> {
    return await this.databaseService.db.select().from(roles);
  }

  async updateUser(
    id: string,
    userBody: UpdateUserDto
  ): Promise<UserResponseDto> {
    const userCheck = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (userCheck.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    let newPasswordHash = userCheck[0].passwordHash;
    if (userBody.password) {
      newPasswordHash = await bcrypt.hash(userBody.password, 10);
    }

    if (userBody.roleId !== undefined) {
      const role = await this.databaseService.db
        .select()
        .from(roles)
        .where(eq(roles.id, userBody.roleId))
        .limit(1);
      if (role.length === 0) {
        throw new BadRequestException(
          `Role with id ${userBody.roleId} not found`
        );
      }
    }

    await this.databaseService.db
      .update(users)
      .set({
        name: userBody.name ?? userCheck[0].name,
        surName: userBody.surName ?? userCheck[0].surName,
        email: userBody.email ?? userCheck[0].email,
        phone: userBody.phone ?? userCheck[0].phone,
        passwordHash: newPasswordHash,
        roleId: userBody.roleId ?? userCheck[0].roleId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    return this.findById(id);
  }

  async updateProfile(
    userId: string,
    profileData: UpdateProfileDto
  ): Promise<UserResponseDto> {
    const userCheck = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userCheck.length === 0) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Update user basic info
    if (
      profileData.name ||
      profileData.surName ||
      profileData.email ||
      profileData.phone
    ) {
      await this.databaseService.db
        .update(users)
        .set({
          name: profileData.name ?? userCheck[0].name,
          surName: profileData.surName ?? userCheck[0].surName,
          email: profileData.email ?? userCheck[0].email,
          phone: profileData.phone ?? userCheck[0].phone,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    // Update cars if provided
    if (profileData.cars && Array.isArray(profileData.cars)) {
      // Get existing cars
      const existingCars = await this.databaseService.db
        .select()
        .from(cars)
        .where(eq(cars.userId, userId));

      const existingCarIds = existingCars.map(c => c.id);
      const providedCarIds = profileData.cars
        .map(c => c.id)
        .filter((id): id is string => id !== undefined);

      // Delete cars that are not in the provided list
      const carsToDelete = existingCarIds.filter(
        id => !providedCarIds.includes(id)
      );
      if (carsToDelete.length > 0) {
        await this.databaseService.db
          .delete(cars)
          .where(inArray(cars.id, carsToDelete));
      }

      // Update or create cars
      for (const carData of profileData.cars) {
        if (carData.id && existingCarIds.includes(carData.id)) {
          // Update existing car
          await this.databaseService.db
            .update(cars)
            .set({
              brand: carData.brand,
              model: carData.model,
              information: carData.information ?? null,
              year: carData.year,
              vin: carData.vin,
              licensePlate: carData.licensePlate ?? null,
            })
            .where(eq(cars.id, carData.id));
        } else {
          // Create new car
          if (carData.brand && carData.model && carData.year && carData.vin) {
            await this.databaseService.db.insert(cars).values({
              userId,
              brand: carData.brand,
              model: carData.model,
              information: carData.information ?? null,
              year: carData.year,
              vin: carData.vin,
              licensePlate: carData.licensePlate ?? null,
            });
          }
        }
      }
    }

    return this.findById(userId);
  }
}
