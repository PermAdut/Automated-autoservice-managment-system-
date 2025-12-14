import { Controller, Get, Param, Res } from '@nestjs/common';
import { ReportService } from './report.service';
import { Response } from 'express';
import { Public } from '../AuthModule/decorators/public.decorator';

@Controller('api/v1.0/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get(':type')
  @Public()
  async generateReport(@Param('type') type: string, @Res() res: Response) {
    console.log(type);
    const html = await this.reportService.generateReport(type);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
