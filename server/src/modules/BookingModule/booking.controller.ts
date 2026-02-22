import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './Dto/create-appointment.dto';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';

@ApiTags('Booking')
@UseGuards(JwtAuthGuard)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('slots')
  @ApiOperation({ summary: 'Get available time slots for employee on date' })
  @ApiQuery({ name: 'employeeId', required: true })
  @ApiQuery({ name: 'date', required: true, description: 'YYYY-MM-DD' })
  getAvailableSlots(
    @Query('employeeId') employeeId: string,
    @Query('date') date: string,
  ) {
    return this.bookingService.getAvailableSlots(employeeId, date);
  }

  @Post('slots/generate')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Generate time slots for employee' })
  generateSlots(
    @Body()
    body: {
      employeeId: string;
      date: string;
      slotDurationMinutes?: number;
      workStart?: number;
      workEnd?: number;
    },
  ) {
    return this.bookingService.generateTimeSlots(
      body.employeeId,
      body.date,
      body.slotDurationMinutes,
      body.workStart,
      body.workEnd,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create online appointment' })
  createAppointment(
    @Request() req: any,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.bookingService.createAppointment(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user appointments' })
  getMyAppointments(@Request() req: any) {
    return this.bookingService.findByUser(req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get all appointments (admin/manager)' })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query('status') status?: string) {
    return this.bookingService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  findOne(@Param('id') id: string) {
    return this.bookingService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update appointment' })
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.bookingService.update(id, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel appointment' })
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.bookingService.cancel(id, req.user.id);
  }
}
