import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PartnersService } from './partners.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';

@ApiTags('Partners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  @ApiOperation({ summary: 'List all partners' })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query('status') status?: string) {
    return this.partnersService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get partner by ID' })
  findOne(@Param('id') id: string) {
    return this.partnersService.findById(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create partner' })
  create(@Body() body: any) {
    return this.partnersService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update partner' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.partnersService.update(id, body);
  }

  @Get(':id/api-keys')
  @ApiOperation({ summary: 'Get partner API keys (hashes only)' })
  getApiKeys(@Param('id') id: string) {
    return this.partnersService.getApiKeys(id);
  }

  @Post(':id/api-keys')
  @Roles('admin')
  @ApiOperation({ summary: 'Generate new API key for partner' })
  generateApiKey(
    @Param('id') id: string,
    @Body() body: { name?: string; scopes?: string },
  ) {
    return this.partnersService.generateApiKey(id, body.name, body.scopes);
  }

  @Patch('api-keys/:keyId/revoke')
  @Roles('admin')
  @ApiOperation({ summary: 'Revoke partner API key' })
  revokeApiKey(@Param('keyId') keyId: string) {
    return this.partnersService.revokeApiKey(keyId);
  }

  @Get(':id/requests')
  @ApiOperation({ summary: 'Get spare part requests from partner' })
  getPartRequests(@Param('id') id: string) {
    return this.partnersService.getPartRequests(id);
  }

  @Post('requests')
  @ApiOperation({ summary: 'Create spare part request between partners' })
  createPartRequest(@Body() body: any) {
    return this.partnersService.createPartRequest(body);
  }

  @Patch('requests/:id/status')
  @ApiOperation({ summary: 'Update spare part request status' })
  updateRequestStatus(
    @Param('id') id: string,
    @Body() body: { status: 'approved' | 'rejected' | 'transferred' | 'cancelled' },
  ) {
    return this.partnersService.updatePartRequestStatus(id, body.status);
  }

  @Post('redirects')
  @ApiOperation({ summary: 'Create client redirect to another partner' })
  createClientRedirect(@Body() body: any) {
    return this.partnersService.createClientRedirect(body);
  }
}
