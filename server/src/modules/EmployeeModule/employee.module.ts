import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EmployeeQualificationService } from './employee-qualification.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeeController],
  providers: [EmployeeService, EmployeeQualificationService],
  exports: [EmployeeService, EmployeeQualificationService],
})
export class EmployeeModule {}
