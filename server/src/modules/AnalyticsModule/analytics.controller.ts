import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';

@ApiTags('Analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpi')
  @ApiOperation({ summary: 'Dashboard KPIs with period comparison' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] })
  getDashboardKpi(@Query('period') period?: 'today' | 'week' | 'month' | 'year') {
    return this.analyticsService.getDashboardKpi(period ?? 'month');
  }

  @Get('orders-by-status')
  @ApiOperation({ summary: 'Order count grouped by status' })
  getOrdersByStatus() {
    return this.analyticsService.getOrdersByStatus();
  }

  @Get('revenue-by-month')
  @ApiOperation({ summary: 'Revenue grouped by month (last 12 months)' })
  getRevenueByMonth() {
    return this.analyticsService.getRevenueByMonth();
  }

  @Get('top-services')
  @ApiOperation({ summary: 'Top services by order count' })
  @ApiQuery({ name: 'limit', required: false })
  getTopServices(@Query('limit') limit?: string) {
    return this.analyticsService.getTopServices(limit ? parseInt(limit, 10) : 10);
  }

  @Get('top-employees')
  @ApiOperation({ summary: 'Top employees by order count and rating' })
  @ApiQuery({ name: 'limit', required: false })
  getTopEmployees(@Query('limit') limit?: string) {
    return this.analyticsService.getTopEmployees(limit ? parseInt(limit, 10) : 10);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Spare parts with low stock (inventory alert)' })
  @ApiQuery({ name: 'threshold', required: false, description: 'Minimum quantity threshold (default: 5)' })
  getLowStock(@Query('threshold') threshold?: string) {
    return this.analyticsService.getLowStockAlerts(threshold ? parseInt(threshold, 10) : 5);
  }

  @Get('upcoming-appointments')
  @ApiOperation({ summary: 'Appointments count by day (next 30 days)' })
  getUpcomingAppointments() {
    return this.analyticsService.getUpcomingAppointments();
  }

  @Get('loyalty-summary')
  @ApiOperation({ summary: 'Loyalty program tier distribution' })
  getLoyaltySummary() {
    return this.analyticsService.getLoyaltySummary();
  }
}
