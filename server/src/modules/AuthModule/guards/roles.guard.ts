import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { DatabaseService } from '../../database/database.service';
import { roles } from '../../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly databaseService: DatabaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }

    const role = await this.databaseService.db
      .select()
      .from(roles)
      .where(eq(roles.id, user.roleId))
      .limit(1);

    if (role.length === 0) {
      return false;
    }

    return requiredRoles.includes(role[0].name);
  }
}
