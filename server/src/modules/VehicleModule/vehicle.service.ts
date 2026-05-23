import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { cars } from '../database/schema';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class VehicleService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findByUser(userId: string) {
    return this.databaseService.db
      .select()
      .from(cars)
      .where(eq(cars.userId, userId))
      .orderBy(desc(cars.id));
  }

  async findById(id: string) {
    const [car] = await this.databaseService.db
      .select()
      .from(cars)
      .where(eq(cars.id, id))
      .limit(1);

    if (!car) throw new NotFoundException(`Vehicle ${id} not found`);
    return car;
  }

  async create(userId: string, data: {
    brand: string;
    model: string;
    year: number;
    vin: string;
    licensePlate?: string;
    information?: string;
    mileage?: number;
  }) {
    const [created] = await this.databaseService.db
      .insert(cars)
      .values({ ...data, userId })
      .returning();
    return created;
  }

  async update(id: string, userId: string, isAdmin: boolean, data: Partial<{
    brand: string;
    model: string;
    year: number;
    vin: string;
    licensePlate: string;
    information: string;
    mileage: number;
  }>) {
    const car = await this.findById(id);
    if (!isAdmin && car.userId !== userId) {
      throw new ForbiddenException('You can only edit your own vehicles');
    }

    const [updated] = await this.databaseService.db
      .update(cars)
      .set(data)
      .where(eq(cars.id, id))
      .returning();
    return updated;
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const car = await this.findById(id);
    if (!isAdmin && car.userId !== userId) {
      throw new ForbiddenException('You can only delete your own vehicles');
    }

    await this.databaseService.db.delete(cars).where(eq(cars.id, id));
    return { deleted: true };
  }

  async findAll() {
    return this.databaseService.db
      .select()
      .from(cars)
      .orderBy(desc(cars.id));
  }
}
