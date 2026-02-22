import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';
import { Public } from '../AuthModule/decorators/public.decorator';

@ApiTags('Tenant')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  /**
   * Public endpoint — called by frontend on app init to load branding & features.
   * No auth required so the login page can also show branded UI.
   */
  @Get('branding')
  @Public()
  @ApiOperation({ summary: 'Get public branding & feature flags (no auth)' })
  getPublicBranding() {
    return this.tenantService.getPublicBranding();
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get full tenant settings (admin)' })
  getSettings() {
    return this.tenantService.getSettings();
  }

  @Put('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update tenant settings (admin)' })
  updateSettings(@Body() body: any) {
    return this.tenantService.updateSettings(body);
  }

  @Post('settings/complete-setup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Mark initial setup as complete' })
  completeSetup() {
    return this.tenantService.completeSetup();
  }

  // Custom pages (About, Privacy, etc.)
  @Get('pages')
  @Public()
  @ApiOperation({ summary: 'List published custom pages' })
  getPages() {
    return this.tenantService.getPages();
  }

  @Get('pages/:slug')
  @Public()
  @ApiOperation({ summary: 'Get custom page by slug' })
  getPage(@Param('slug') slug: string) {
    return this.tenantService.getPageBySlug(slug);
  }

  @Post('pages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create or update custom page (admin)' })
  upsertPage(@Body() body: any) {
    return this.tenantService.upsertPage(body);
  }
}
