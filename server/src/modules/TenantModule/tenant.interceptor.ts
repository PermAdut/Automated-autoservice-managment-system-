import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly tenantCtx: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    const tenantId: string | undefined =
      request.user?.tenantId ?? request.headers['x-tenant-id'];

    if (!tenantId) {
      return next.handle();
    }

    return new Observable(observer => {
      this.tenantCtx.run(tenantId, () => {
        next.handle().subscribe({
          next: val => observer.next(val),
          error: err => observer.error(err),
          complete: () => observer.complete(),
        });
      });
    });
  }
}
