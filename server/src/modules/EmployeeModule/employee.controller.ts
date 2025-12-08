import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { EmployeeResponse } from './Dto/employee.response';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';
import { Public } from '../AuthModule/decorators/public.decorator';
import { CreateEmployeeDto } from './Dto/create-employee.dto';
import { UpdateEmployeeDto } from './Dto/update-employee.dto';

@Controller('api/v1.0/employee')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({
    status: 200,
    description: 'The employees have been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'No employees found.' })
  async getEmployees(
    @Query('search') search?: string,
    @Query('sortBy')
    sortBy: 'name' | 'salary' | 'hireDate' | 'id' | undefined = 'name',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<EmployeeResponse[]> {
    return await this.employeeService.getEmployees(search, sortBy, sortOrder);
  }

  @Get('positions')
  @Public()
  @ApiOperation({ summary: 'Get all positions for employees' })
  async getPositions() {
    return await this.employeeService.getPositions();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get employee by id' })
  async getEmployeeById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<EmployeeResponse> {
    return await this.employeeService.getEmployeeById(id);
  }

  @Post()
  @HttpCode(201)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create new employee' })
  async createEmployee(
    @Body() employeeData: CreateEmployeeDto
  ): Promise<EmployeeResponse> {
    return await this.employeeService.createEmployee(employeeData);
  }

  @Put(':id')
  @HttpCode(200)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update employee' })
  async updateEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() employeeData: UpdateEmployeeDto
  ): Promise<EmployeeResponse> {
    return await this.employeeService.updateEmployee(id, employeeData);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete employee' })
  async deleteEmployee(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.employeeService.deleteEmployee(id);
  }
}
