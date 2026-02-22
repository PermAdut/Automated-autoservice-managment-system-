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
import { DiagnosticsService } from './diagnostics.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';

@ApiTags('Diagnostics')
@UseGuards(JwtAuthGuard)
@Controller('diagnostics')
export class DiagnosticsController {
  constructor(private readonly diagnosticsService: DiagnosticsService) {}

  @Get('dtc')
  @ApiOperation({ summary: 'Search DTC codes catalog' })
  @ApiQuery({ name: 'q', required: false, description: 'Code prefix (e.g. P0)' })
  searchDtc(@Query('q') q?: string) {
    return this.diagnosticsService.searchDtcCodes(q);
  }

  @Get('dtc/:code')
  @ApiOperation({ summary: 'Get DTC code details' })
  getDtc(@Param('code') code: string) {
    return this.diagnosticsService.getDtcCode(code);
  }

  @Post('dtc')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Add DTC code to catalog (admin)' })
  createDtc(@Body() body: any) {
    return this.diagnosticsService.createDtcCode(body);
  }

  @Post('sessions')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'employee')
  @ApiOperation({ summary: 'Create diagnostic session' })
  createSession(@Body() body: any) {
    return this.diagnosticsService.createSession(body);
  }

  @Get('sessions/car/:carId')
  @ApiOperation({ summary: 'Get diagnostic sessions for a car' })
  getSessionsByCar(@Param('carId') carId: string) {
    return this.diagnosticsService.getSessionsBycar(carId);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get diagnostic session with results' })
  getSession(@Param('id') id: string) {
    return this.diagnosticsService.getSession(id);
  }

  @Get('reminders')
  @ApiOperation({ summary: 'Get maintenance reminders for current user' })
  @ApiQuery({ name: 'carId', required: false })
  getReminders(@Request() req: any, @Query('carId') carId?: string) {
    return this.diagnosticsService.getReminders(req.user.id, carId);
  }

  @Post('reminders')
  @ApiOperation({ summary: 'Create maintenance reminder' })
  createReminder(@Request() req: any, @Body() body: any) {
    return this.diagnosticsService.createReminder({
      ...body,
      userId: req.user.id,
    });
  }

  @Patch('reminders/:id/complete')
  @ApiOperation({ summary: 'Mark maintenance reminder as completed' })
  completeReminder(@Param('id') id: string) {
    return this.diagnosticsService.completeReminder(id);
  }
}
