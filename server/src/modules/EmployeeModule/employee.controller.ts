import { Controller, Get } from '@nestjs/common';
import { EmployeeResponse } from './Dto/employee.response';
import { ApiResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
@Controller()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}
  @Get('api/v1.0/employee')
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({
    status: 200,
    description: 'The employees have been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'No employees found.' })
  async getEmployees(): Promise<EmployeeResponse[]> {
    return await this.employeeService.getEmployees();
  }
}
