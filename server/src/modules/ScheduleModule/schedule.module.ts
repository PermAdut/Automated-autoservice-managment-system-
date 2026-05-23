import { Module } from '@nestjs/common';
import { ScheduleOptimizationService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { DatabaseModule } from '../database/database.module';
import { GatewayModule } from '../GatewayModule/gateway.module';
import { EmployeeModule } from '../EmployeeModule/employee.module';

@Module({
  imports: [DatabaseModule, GatewayModule, EmployeeModule],
  controllers: [ScheduleController],
  providers: [ScheduleOptimizationService],
  exports: [ScheduleOptimizationService],
})
export class ScheduleOptimizationModule {}
