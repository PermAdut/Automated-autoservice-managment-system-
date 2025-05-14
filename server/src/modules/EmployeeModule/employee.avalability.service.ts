import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class EmployeeAvailabilityService {
  constructor(private readonly databaseService: DatabaseService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateEmployeeAvailability() {
    try {
      await this.databaseService.query(`
        SELECT update_all_employee_availability();
      `);
      console.log('Employee availability updated via function');
    } catch (error) {
      console.error('Error updating employee availability:', error);
    }
  }
}
