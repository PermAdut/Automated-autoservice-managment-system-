import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceResponseDto } from './Dto/service.response';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';
import { Public } from '../AuthModule/decorators/public.decorator';

@Controller('api/v1.0/services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all services' })
  @ApiResponse({
    status: 200,
    description: 'The services have been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'No services found.' })
  async findAll(
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ): Promise<ServiceResponseDto[]> {
    return await this.serviceService.findAll(search, sortBy, sortOrder);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get service by id' })
  async findById(@Param('id') id: string): Promise<ServiceResponseDto> {
    return await this.serviceService.findById(id);
  }

  @Post()
  @HttpCode(201)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create new service' })
  async create(@Body() serviceData: any): Promise<ServiceResponseDto> {
    return await this.serviceService.create(serviceData);
  }

  @Put(':id')
  @HttpCode(200)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update service' })
  async update(
    @Param('id') id: string,
    @Body() serviceData: any
  ): Promise<ServiceResponseDto> {
    return await this.serviceService.update(id, serviceData);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete service' })
  async delete(@Param('id') id: string): Promise<void> {
    return await this.serviceService.delete(id);
  }
}
