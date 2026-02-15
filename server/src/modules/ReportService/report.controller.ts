import { Controller, Get, Param } from '@nestjs/common';
import { ReportService, ReportData } from './report.service';
import { Public } from '../AuthModule/decorators/public.decorator';

@Controller('api/v1.0/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get(':type')
  @Public()
  async generateReport(@Param('type') type: string): Promise<ReportData> {
    return this.reportService.generateReport(type);
  }
}
