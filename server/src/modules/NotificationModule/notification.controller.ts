import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../AuthModule/types/auth.types';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SendSmsDto {
  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  message: string;
}

class SendFromTemplateDto {
  @ApiProperty()
  @IsString()
  templateName: string;

  @ApiProperty()
  @IsString()
  recipient: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;
}

class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ['email', 'sms', 'push'] })
  @IsEnum(['email', 'sms', 'push'])
  channel: 'email' | 'sms' | 'push';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  variables?: string;
}

class UpsertChannelDto {
  @ApiProperty({ enum: ['email', 'sms', 'push'] })
  @IsEnum(['email', 'sms', 'push'])
  channel: 'email' | 'sms' | 'push';

  @ApiProperty()
  @IsString()
  address: string;
}

@ApiTags('Notifications')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get current user notifications' })
  getMyNotifications(@Request() req: AuthenticatedRequest) {
    return this.notificationService.findByUser(req.user.userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get all notifications (admin/manager)' })
  getAll() {
    return this.notificationService.findAll();
  }

  @Post('sms')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Send SMS to a phone number' })
  sendSms(@Request() req: AuthenticatedRequest, @Body() dto: SendSmsDto) {
    return this.notificationService.sendSms(req.user.userId, dto.phone, dto.message);
  }

  @Post('send')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Send notification from template' })
  sendFromTemplate(@Request() req: AuthenticatedRequest, @Body() dto: SendFromTemplateDto) {
    return this.notificationService.sendFromTemplate(
      req.user.userId,
      dto.templateName,
      dto.recipient,
      dto.variables,
    );
  }

  @Get('templates')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'List notification templates' })
  getTemplates() {
    return this.notificationService.getTemplates();
  }

  @Post('templates')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create notification template' })
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.notificationService.createTemplate(dto);
  }

  @Get('channels')
  @ApiOperation({ summary: 'Get current user notification channels' })
  getMyChannels(@Request() req: AuthenticatedRequest) {
    return this.notificationService.getUserChannels(req.user.userId);
  }

  @Post('channels')
  @ApiOperation({ summary: 'Add or update a notification channel' })
  upsertChannel(@Request() req: AuthenticatedRequest, @Body() dto: UpsertChannelDto) {
    return this.notificationService.upsertChannel(
      req.user.userId,
      dto.channel,
      dto.address,
    );
  }
}
