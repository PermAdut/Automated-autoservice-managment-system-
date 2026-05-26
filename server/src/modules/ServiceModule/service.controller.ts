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
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceResponseDto } from './Dto/service.response';
import { ServiceCategoryResponseDto } from './Dto/service-category-response.dto';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';
import { Public } from '../AuthModule/decorators/public.decorator';
import { CreateServiceDto } from './Dto/create-service.dto';
import { UpdateServiceDto } from './Dto/update-service.dto';
import { CreateServiceCategoryDto } from './Dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './Dto/update-service-category.dto';
import { EmployeeQualificationService } from '../EmployeeModule/employee-qualification.service';

@Controller('api/v1.0/services')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
export class ServiceController {
  constructor(
    private readonly serviceService: ServiceService,
    private readonly qualificationService: EmployeeQualificationService,
  ) {}

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
    @Query('sortBy') sortBy: 'name' | 'price' | 'id' | undefined = 'name',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<ServiceResponseDto[]> {
    return await this.serviceService.findAll(search, sortBy, sortOrder);
  }

  @Get(':id/qualified-employees')
  @Roles('admin', 'manager', 'customer')
  @ApiOperation({ summary: 'Get employees qualified for this service' })
  getQualifiedEmployees(@Param('id', ParseUUIDPipe) id: string) {
    return this.qualificationService.findQualifiedEmployeesForService(id);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get service by id' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<ServiceResponseDto> {
    return await this.serviceService.findById(id);
  }

  @Post()
  @HttpCode(201)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create new service' })
  async create(
    @Body() serviceData: CreateServiceDto
  ): Promise<ServiceResponseDto> {
    return await this.serviceService.create(serviceData);
  }

  @Put(':id')
  @HttpCode(200)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update service' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() serviceData: UpdateServiceDto
  ): Promise<ServiceResponseDto> {
    return await this.serviceService.update(id, serviceData);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete service' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.serviceService.delete(id);
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Get all service categories' })
  async findAllCategories(
    @Query('search') search?: string
  ): Promise<ServiceCategoryResponseDto[]> {
    return await this.serviceService.findAllCategories(search);
  }

  @Get('categories/:id')
  @Public()
  @ApiOperation({ summary: 'Get service category by id' })
  async findCategoryById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<ServiceCategoryResponseDto> {
    return await this.serviceService.findCategoryById(id);
  }

  @Post('categories')
  @HttpCode(201)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create service category' })
  async createCategory(
    @Body() dto: CreateServiceCategoryDto
  ): Promise<ServiceCategoryResponseDto> {
    return await this.serviceService.createCategory(dto);
  }

  @Put('categories/:id')
  @HttpCode(200)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update service category' })
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceCategoryDto
  ): Promise<ServiceCategoryResponseDto> {
    return await this.serviceService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(204)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete service category' })
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.serviceService.deleteCategory(id);
  }
}
