import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ScheduleOptimizationService } from './schedule.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';

@ApiTags('Schedule')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
@Controller('api/v1.0/schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleOptimizationService) {}

  @Get('gantt')
  @ApiOperation({ summary: 'Get Gantt chart data for a date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'date', required: false, example: '2026-04-20' })
  getGantt(@Query('date') date?: string) {
    const target = date ?? new Date().toISOString().slice(0, 10);
    return this.scheduleService.getGanttData(target);
  }

  @Post('optimize')
  @ApiOperation({ summary: 'Run post-load optimization algorithm' })
  optimize(@Body() body: { windowHours?: number }) {
    return this.scheduleService.optimizeSchedule(body.windowHours ?? 8);
  }

  @Patch('reassign')
  @ApiOperation({ summary: 'Manually reassign an order to an employee' })
  reassign(@Body() body: { orderId: string; employeeId: string }) {
    return this.scheduleService.reassignOrder(body.orderId, body.employeeId);
  }
}
