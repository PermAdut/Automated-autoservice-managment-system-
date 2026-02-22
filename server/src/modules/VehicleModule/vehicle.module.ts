import { Module } from '@nestjs/common';
import { VinDecoderService } from './vin-decoder.service';
import { VehicleController } from './vehicle.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [VehicleController],
  providers: [VinDecoderService],
  exports: [VinDecoderService],
})
export class VehicleModule {}
