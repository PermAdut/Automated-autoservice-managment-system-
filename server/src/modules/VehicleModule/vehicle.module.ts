import { Module } from '@nestjs/common';
import { VinDecoderService } from './vin-decoder.service';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [VehicleController],
  providers: [VinDecoderService, VehicleService],
  exports: [VinDecoderService, VehicleService],
})
export class VehicleModule {}
