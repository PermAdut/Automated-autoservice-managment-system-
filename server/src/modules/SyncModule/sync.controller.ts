import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../AuthModule/types/auth.types';

@ApiTags('Sync')
@UseGuards(JwtAuthGuard)
@Controller('api/v1.0/sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('log')
  @ApiOperation({ summary: 'Get sync log for current user' })
  getLog(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
  ) {
    const parsed = limit ? parseInt(limit, 10) : 50;
    return this.syncService.findByUser(req.user.userId, parsed);
  }

  @Post('log')
  @ApiOperation({ summary: 'Record a sync operation result' })
  createLog(
    @Request() req: AuthenticatedRequest,
    @Body()
    body: {
      operation: string;
      entity: string;
      entityId: string;
      status: string;
      error?: string;
    },
  ) {
    return this.syncService.createEntry(req.user.userId, body);
  }
}
