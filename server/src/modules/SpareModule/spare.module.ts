import { Module } from '@nestjs/common';
import { SpareService } from './spare.service';
import { SpareController } from './spare.controller';
import { DatabaseService } from '../database/database.service';
@Module({
  imports: [],
  controllers: [SpareController],
  providers: [SpareService, DatabaseService],
  exports: [SpareService],
})
export class SpareModule {}
