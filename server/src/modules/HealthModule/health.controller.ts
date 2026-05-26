import { Controller, Get } from '@nestjs/common';
import { Public } from '../AuthModule/decorators/public.decorator';

@Controller()
export class HealthController {
  @Public()
  @Get('health')
  rootHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /** Alias for clients that expect API prefix (e.g. some proxies / docs) */
  @Public()
  @Get('api/v1.0/health')
  apiHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
