import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';
import { resolveBranchFilter } from '../AuthModule/helpers/branch-scope.helper';
import type { AuthenticatedRequest } from '../AuthModule/types/auth.types';

@ApiTags('Analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
@Controller('api/v1.0/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  private branchScope(req: AuthenticatedRequest, queryBranchId?: string) {
    return resolveBranchFilter(req.user, queryBranchId);
  }

  @Get('kpi')
  @ApiOperation({ summary: 'Dashboard KPIs with period comparison' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] })
  @ApiQuery({ name: 'branchId', required: false })
  getDashboardKpi(
    @Request() req: AuthenticatedRequest,
    @Query('period') period?: 'today' | 'week' | 'month' | 'year',
    @Query('branchId') branchId?: string,
  ) {
    return this.analyticsService.getDashboardKpi(
      period ?? 'month',
      this.branchScope(req, branchId),
    );
  }

  @Get('orders-by-status')
  @ApiQuery({ name: 'branchId', required: false })
  getOrdersByStatus(
    @Request() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
  ) {
    return this.analyticsService.getOrdersByStatus(this.branchScope(req, branchId));
  }

  @Get('revenue-by-month')
  @ApiQuery({ name: 'branchId', required: false })
  getRevenueByMonth(
    @Request() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
  ) {
    return this.analyticsService.getRevenueByMonth(this.branchScope(req, branchId));
  }

  @Get('top-services')
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  getTopServices(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.analyticsService.getTopServices(
      limit ? parseInt(limit, 10) : 10,
      this.branchScope(req, branchId),
    );
  }

  @Get('top-employees')
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  getTopEmployees(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.analyticsService.getTopEmployees(
      limit ? parseInt(limit, 10) : 10,
      this.branchScope(req, branchId),
    );
  }

  @Get('low-stock')
  @ApiQuery({ name: 'threshold', required: false })
  getLowStock(@Query('threshold') threshold?: string) {
    return this.analyticsService.getLowStockAlerts(threshold ? parseInt(threshold, 10) : 5);
  }

  @Get('upcoming-appointments')
  getUpcomingAppointments() {
    return this.analyticsService.getUpcomingAppointments();
  }

  @Get('loyalty-summary')
  getLoyaltySummary() {
    return this.analyticsService.getLoyaltySummary();
  }

  @Get('branches-comparison')
  @Roles('admin')
  @ApiOperation({ summary: 'Compare KPI across all branches (admin only)' })
  getBranchesComparison() {
    return this.analyticsService.getBranchesComparison();
  }
}
