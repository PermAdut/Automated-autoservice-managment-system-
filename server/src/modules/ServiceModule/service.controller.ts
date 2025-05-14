import { Controller, Get } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceResponseDto } from './Dto/service.response';
import { ApiResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';

@Controller('api/v1.0/services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  @ApiResponse({
    status: 200,
    description: 'The services have been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'No services found.' })
  async findAll(): Promise<ServiceResponseDto[]> {
    return await this.serviceService.findAll();
  }
}
