import { Module } from '@nestjs/common';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [ServiceController],
  providers: [ServiceService, DatabaseService],
  exports: [ServiceService],
})
export class ServiceModule {}
