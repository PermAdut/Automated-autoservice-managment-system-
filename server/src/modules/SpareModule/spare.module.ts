import { Module } from '@nestjs/common';
import { SpareService } from './spare.service';
import { SpareController } from './spare.controller';

@Module({
  imports: [],
  controllers: [SpareController],
  providers: [SpareService],
  exports: [SpareService],
})
export class SpareModule {}
