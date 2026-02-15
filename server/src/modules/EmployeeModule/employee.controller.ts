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
  ParseUUIDPipe,
  NotFoundException,
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
import { SubscribeEmployeeDto } from './Dto/subscribe-employee.dto';
import { CreateReviewDto } from './Dto/create-review.dto';
import { Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('api/v1.0/employee')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  private getAuth(req?: Request) {
    const authUser = (req as any)?.user as
      | { userId?: string; roleName?: string }
      | undefined;
    return { userId: authUser?.userId, role: authUser?.roleName };
  }

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
    @Param('id', ParseUUIDPipe) id: string
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
    @Param('id', ParseUUIDPipe) id: string,
    @Body() employeeData: UpdateEmployeeDto
  ): Promise<EmployeeResponse> {
    return await this.employeeService.updateEmployee(id, employeeData);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete employee' })
  async deleteEmployee(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.employeeService.deleteEmployee(id);
  }

  @Post(':id/subscribe')
  @HttpCode(201)
  @ApiOperation({ summary: 'Subscribe to employee schedule' })
  async subscribeToEmployee(
    @Param('id', ParseUUIDPipe) employeeId: string,
    @Req() req: Request
  ) {
    const { userId } = this.getAuth(req);
    if (!userId) {
      throw new NotFoundException('User not authorized');
    }
    return await this.employeeService.subscribeToEmployee(userId, {
      employeeId,
    });
  }

  @Delete(':id/subscribe')
  @HttpCode(200)
  @ApiOperation({ summary: 'Unsubscribe from employee schedule' })
  async unsubscribeFromEmployee(
    @Param('id', ParseUUIDPipe) employeeId: string,
    @Req() req: Request
  ) {
    const { userId } = this.getAuth(req);
    if (!userId) {
      throw new NotFoundException('User not authorized');
    }
    return await this.employeeService.unsubscribeFromEmployee(
      userId,
      employeeId
    );
  }

  @Get(':id/subscription')
  @ApiOperation({ summary: 'Get user subscription status for employee' })
  async getUserSubscription(
    @Param('id', ParseUUIDPipe) employeeId: string,
    @Req() req: Request
  ) {
    const { userId } = this.getAuth(req);
    if (!userId) {
      return { subscribed: false };
    }
    const subscription = await this.employeeService.getUserSubscription(
      userId,
      employeeId
    );
    return { subscribed: !!subscription, subscription };
  }

  @Post(':id/reviews')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create review for employee' })
  async createReview(
    @Param('id', ParseUUIDPipe) employeeId: string,
    @Body() createReviewDto: Omit<CreateReviewDto, 'employeeId'>,
    @Req() req: any
  ) {
    const userId = req.user.userId;
    return await this.employeeService.createReview(userId, {
      ...createReviewDto,
      employeeId,
    });
  }

  @Get(':id/reviews')
  @Public()
  @ApiOperation({ summary: 'Get employee reviews' })
  async getEmployeeReviews(@Param('id', ParseUUIDPipe) employeeId: string) {
    return await this.employeeService.getEmployeeReviews(employeeId);
  }
}
