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
} from '@nestjs/common';
import { EmployeeResponse } from './Dto/employee.response';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';
import { Public } from '../AuthModule/decorators/public.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('api/v1.0/employee')
  @Public()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({
    status: 200,
    description: 'The employees have been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'No employees found.' })
  async getEmployees(): Promise<EmployeeResponse[]> {
    return await this.employeeService.getEmployees();
  }

  @Get('api/v1.0/employee/:id')
  @Public()
  @ApiOperation({ summary: 'Get employee by id' })
  async getEmployeeById(@Param('id') id: string): Promise<EmployeeResponse> {
    return await this.employeeService.getEmployeeById(id);
  }

  @Post('api/v1.0/employee')
  @HttpCode(201)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create new employee' })
  async createEmployee(@Body() employeeData: any): Promise<EmployeeResponse> {
    return await this.employeeService.createEmployee(employeeData);
  }

  @Put('api/v1.0/employee/:id')
  @HttpCode(200)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update employee' })
  async updateEmployee(
    @Param('id') id: string,
    @Body() employeeData: any
  ): Promise<EmployeeResponse> {
    return await this.employeeService.updateEmployee(id, employeeData);
  }

  @Delete('api/v1.0/employee/:id')
  @HttpCode(204)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete employee' })
  async deleteEmployee(@Param('id') id: string): Promise<void> {
    return await this.employeeService.deleteEmployee(id);
  }
}
