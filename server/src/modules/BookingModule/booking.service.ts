import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  appointments,
  timeSlots,
  cars,
} from '../database/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { CreateAppointmentDto, UpdateAppointmentDto } from './Dto/create-appointment.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class BookingService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAvailableSlots(employeeId: string, date: string) {
    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return this.databaseService.db
      .select()
      .from(timeSlots)
      .where(
        and(
          eq(timeSlots.employeeId, employeeId),
          gte(timeSlots.date, targetDate),
          lte(timeSlots.date, nextDay),
          eq(timeSlots.isBooked, false),
        )
      )
      .orderBy(timeSlots.startTime);
  }

  async createAppointment(userId: string, dto: CreateAppointmentDto) {
    // Validate car belongs to user
    const car = await this.databaseService.db
      .select()
      .from(cars)
      .where(and(eq(cars.id, dto.carId), eq(cars.userId, userId)))
      .limit(1);

    if (!car.length) {
      throw new BadRequestException('Car not found or does not belong to user');
    }

    // If timeSlotId provided — mark slot as booked
    if (dto.timeSlotId) {
      const slot = await this.databaseService.db
        .select()
        .from(timeSlots)
        .where(eq(timeSlots.id, dto.timeSlotId))
        .limit(1);

      if (!slot.length || slot[0].isBooked) {
        throw new BadRequestException('Time slot is not available');
      }

      await this.databaseService.db
        .update(timeSlots)
        .set({ isBooked: true })
        .where(eq(timeSlots.id, dto.timeSlotId));
    }

    const confirmationCode = randomBytes(4).toString('hex').toUpperCase();

    const [created] = await this.databaseService.db
      .insert(appointments)
      .values({
        userId,
        carId: dto.carId,
        serviceId: dto.serviceId,
        employeeId: dto.employeeId,
        timeSlotId: dto.timeSlotId,
        scheduledAt: new Date(dto.scheduledAt),
        notes: dto.notes,
        confirmationCode,
        status: 'pending',
      })
      .returning();

    return created;
  }

  async findByUser(userId: string) {
    return this.databaseService.db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, userId))
      .orderBy(desc(appointments.scheduledAt));
  }

  async findAll(status?: string) {
    let query = this.databaseService.db.select().from(appointments);
    if (status) {
      query = query.where(eq(appointments.status, status as any)) as any;
    }
    return query.orderBy(desc(appointments.scheduledAt));
  }

  async findById(id: string) {
    const [appointment] = await this.databaseService.db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);

    if (!appointment) {
      throw new NotFoundException(`Appointment ${id} not found`);
    }
    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const [updated] = await this.databaseService.db
      .update(appointments)
      .set({
        ...(dto.employeeId && { employeeId: dto.employeeId }),
        ...(dto.timeSlotId && { timeSlotId: dto.timeSlotId }),
        ...(dto.scheduledAt && { scheduledAt: new Date(dto.scheduledAt) }),
        ...(dto.status && { status: dto.status as any }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Appointment ${id} not found`);
    }
    return updated;
  }

  async cancel(id: string, userId: string) {
    const appointment = await this.findById(id);

    if (appointment.userId !== userId) {
      throw new BadRequestException('Cannot cancel appointment that does not belong to you');
    }

    if (['completed', 'cancelled'].includes(appointment.status)) {
      throw new BadRequestException(`Appointment is already ${appointment.status}`);
    }

    // Free the time slot
    if (appointment.timeSlotId) {
      await this.databaseService.db
        .update(timeSlots)
        .set({ isBooked: false })
        .where(eq(timeSlots.id, appointment.timeSlotId));
    }

    const [updated] = await this.databaseService.db
      .update(appointments)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();

    return updated;
  }

  async generateTimeSlots(
    employeeId: string,
    date: string,
    slotDurationMinutes = 60,
    workStart = 9,
    workEnd = 18,
  ) {
    const targetDate = new Date(date);
    const slots: {
      employeeId: string;
      date: Date;
      startTime: Date;
      endTime: Date;
      isBooked: boolean;
    }[] = [];

    for (let hour = workStart; hour < workEnd; hour += slotDurationMinutes / 60) {
      const startTime = new Date(targetDate);
      startTime.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + slotDurationMinutes);

      slots.push({
        employeeId,
        date: targetDate,
        startTime,
        endTime,
        isBooked: false,
      });
    }

    const created = await this.databaseService.db
      .insert(timeSlots)
      .values(slots)
      .returning();

    return created;
  }
}
