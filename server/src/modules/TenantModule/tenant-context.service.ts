import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

interface TenantStore {
  tenantId: string;
}

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantStore>();

  run<T>(tenantId: string, fn: () => T): T {
    return this.storage.run({ tenantId }, fn);
  }

  getTenantId(): string {
    const store = this.storage.getStore();
    if (!store?.tenantId) {
      throw new UnauthorizedException('No tenant context in current request');
    }
    return store.tenantId;
  }

  getTenantIdOrNull(): string | null {
    return this.storage.getStore()?.tenantId ?? null;
  }
}
