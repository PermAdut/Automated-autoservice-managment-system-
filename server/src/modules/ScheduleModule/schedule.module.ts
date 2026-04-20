import { Module } from '@nestjs/common';
import { ScheduleOptimizationService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { DatabaseModule } from '../database/database.module';
import { GatewayModule } from '../GatewayModule/gateway.module';

@Module({
  imports: [DatabaseModule, GatewayModule],
  controllers: [ScheduleController],
  providers: [ScheduleOptimizationService],
  exports: [ScheduleOptimizationService],
})
export class ScheduleOptimizationModule {}
