import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { DatabaseService } from '../database/database.service';
@Module({
  imports: [],
  controllers: [EmployeeController],
  providers: [EmployeeService, DatabaseService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
