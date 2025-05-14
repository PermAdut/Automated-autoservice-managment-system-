import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { DatabaseService } from '../database/database.service';
@Module({
  controllers: [ReportController],
  providers: [ReportService, DatabaseService],
  exports: [ReportService],
})
export class ReportModule {}
