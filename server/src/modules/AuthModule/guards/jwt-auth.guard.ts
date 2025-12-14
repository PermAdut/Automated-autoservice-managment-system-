import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Для публичных endpoints все равно пытаемся установить user, если токен есть
      try {
        // Пытаемся активировать guard, чтобы установить req.user
        const result = super.canActivate(context);
        // Если результат - Promise, ждем его, но игнорируем ошибки
        if (result instanceof Promise) {
          result.catch(() => {
            // Если токена нет или он невалидный, просто игнорируем ошибку
            // req.user останется undefined
          });
        }
      } catch {
        // Если токена нет или он невалидный, просто разрешаем доступ без user
        // req.user останется undefined
      }
      return true;
    }

    return super.canActivate(context);
  }
}
