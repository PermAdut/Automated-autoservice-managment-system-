import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
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

  @Get(':type/csv')
  @Public()
  async downloadCsv(@Param('type') type: string, @Res() res: Response) {
    const report = await this.reportService.generateReport(type);
    const csv = this.reportService.toCsv(report);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${type}-report-${new Date().toISOString().slice(0, 10)}.csv"`,
    );
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8 compatibility
  }

  @Get(':type/pdf')
  @Public()
  async downloadPdf(@Param('type') type: string, @Res() res: Response) {
    const report = await this.reportService.generateReport(type);
    const pdfBuffer = await this.reportService.toPdf(report);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${type}-report-${new Date().toISOString().slice(0, 10)}.pdf"`,
    );
    res.send(pdfBuffer);
  }
}
