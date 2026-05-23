import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VinDecoderService } from './vin-decoder.service';
import { VehicleService } from './vehicle.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';
import { IsArray, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import type { AuthenticatedRequest } from '../AuthModule/types/auth.types';

class DecodeBatchDto {
  @ApiProperty({ type: [String], description: 'List of VINs to decode' })
  @IsArray()
  @IsString({ each: true })
  vins: string[];
}

class CreateVehicleDto {
  @ApiProperty() @IsString() brand: string;
  @ApiProperty() @IsString() model: string;
  @ApiProperty() @IsNumber() @Type(() => Number) @Min(1900) @Max(2100) year: number;
  @ApiProperty() @IsString() vin: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() licensePlate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() information?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Type(() => Number) @Min(0) mileage?: number;
}

class UpdateVehicleDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() brand?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() model?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Type(() => Number) year?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() vin?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() licensePlate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() information?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Type(() => Number) @Min(0) mileage?: number;
}

@ApiTags('Vehicle')
@UseGuards(JwtAuthGuard)
@Controller('api/v1.0/vehicle')
export class VehicleController {
  constructor(
    private readonly vinDecoderService: VinDecoderService,
    private readonly vehicleService: VehicleService,
  ) {}

  // ── Car CRUD ──────────────────────────────────────────────────────────────

  @Get('my')
  @ApiOperation({ summary: 'Get my vehicles' })
  getMy(@Request() req: AuthenticatedRequest) {
    return this.vehicleService.findByUser(req.user.userId);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get all vehicles (admin/manager)' })
  getAll() {
    return this.vehicleService.findAll();
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get vehicles by user ID (admin/manager)' })
  getByUser(@Param('userId') userId: string) {
    return this.vehicleService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  getOne(@Param('id') id: string) {
    return this.vehicleService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a vehicle to my account' })
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateVehicleDto) {
    return this.vehicleService.create(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vehicle' })
  update(@Param('id') id: string, @Request() req: AuthenticatedRequest, @Body() dto: UpdateVehicleDto) {
    const isAdmin = ['admin', 'manager'].includes(req.user.roleName ?? '');
    return this.vehicleService.update(id, req.user.userId, isAdmin, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vehicle' })
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const isAdmin = ['admin', 'manager'].includes(req.user.roleName ?? '');
    return this.vehicleService.remove(id, req.user.userId, isAdmin);
  }

  // ── VIN Decoder ───────────────────────────────────────────────────────────

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
