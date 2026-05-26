import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../RedisModule/redis.service';
import { users, roles } from '../../database/schema';
import { eq } from 'drizzle-orm';
import type { JwtPayload } from '../types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;

    if (token && (await this.redisService.isTokenBlacklisted(token))) {
      throw new UnauthorizedException('Token revoked');
    }

    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Учётная запись заблокирована');
    }

    let roleName: string | undefined;
    if (user.roleId) {
      const [role] = await this.databaseService.db
        .select({ name: roles.name })
        .from(roles)
        .where(eq(roles.id, user.roleId))
        .limit(1);
      roleName = role?.name;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      roleId: payload.roleId,
      roleName,
      branchId: user.branchId,
    };
  }
}
