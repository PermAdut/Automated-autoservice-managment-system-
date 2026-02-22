import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VinDecoderService } from './vin-decoder.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class DecodeBatchDto {
  @ApiProperty({ type: [String], description: 'List of VINs to decode' })
  @IsArray()
  @IsString({ each: true })
  vins: string[];
}

@ApiTags('Vehicle')
@UseGuards(JwtAuthGuard)
@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vinDecoderService: VinDecoderService) {}

  @Get('vin/:vin')
  @ApiOperation({ summary: 'Decode a single VIN via NHTSA vPIC API' })
  decodeVin(@Param('vin') vin: string) {
    return this.vinDecoderService.decodeVin(vin);
  }

  @Post('vin/batch')
  @ApiOperation({ summary: 'Decode multiple VINs in parallel' })
  decodeBatch(@Body() dto: DecodeBatchDto) {
    return this.vinDecoderService.decodeVinBatch(dto.vins);
  }
}
