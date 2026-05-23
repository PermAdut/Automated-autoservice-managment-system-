# ФТ-1: Аутентификация и управление доступом

Источник: [FUNCTIONAL_REQUIREMENTS.md](../FUNCTIONAL_REQUIREMENTS.md) §2.3.1

## Требование

Надёжное разграничение прав: регистрация и вход по email/паролю, OAuth Google, JWT access/refresh, ролевая модель, logout с блокировкой токена, auto-refresh, защита от brute-force, безопасное хранение токенов в desktop-приложении.

## Реализация

| Возможность | Статус | Где |
|---|---|---|
| Регистрация email + пароль | ✅ | `POST /auth/register` — `server/src/modules/AuthModule/auth.controller.ts`, `auth.service.ts` |
| Вход email + пароль | ✅ | `POST /auth/login` — `auth.service.ts` → `validateUser()` + `login()` |
| Пароли в bcrypt | ✅ | `bcrypt.hash` / `bcrypt.compare` в `auth.service.ts`; поле `Users.passwordHash` |
| Google OAuth | ✅ | `GET /auth/google`, `GET /auth/google/callback` — `strategies/google.strategy.ts`, `validateGoogleUser()` |
| Access token 15 мин | ✅ | `jwtService.sign(payload, { expiresIn: '15m' })` в `auth.service.ts` |
| Refresh token 7 дней | ✅ | `generateRefreshToken()` — таблица `RefreshTokens`, TTL 7 дней |
| Роли admin / manager / customer | ✅ | `RolesGuard` + `@Roles()` — `guards/roles.guard.ts`, `decorators/roles.decorator.ts` |
| Logout + отзыв refresh | ✅ | `POST /auth/logout` → `revokeRefreshToken()` — удаление из `RefreshTokens` |
| Auto-refresh access | ✅ | RTK Query interceptor — `frontend/src/api/baseApi.ts`, `electron-opus/src/renderer/src/api/baseApi.ts` |
| Brute-force: 5 попыток / 1 мин | ✅ | Redis key `login_fail:{email}` — `auth.service.ts` (`MAX_ATTEMPTS=5`, `BLOCK_TTL=60`) |
| JWT guard на защищённых routes | ✅ | `JwtAuthGuard` — `guards/jwt-auth.guard.ts`; глобально в модулях через `@UseGuards` |
| Публичные endpoints | ✅ | `@Public()` — `decorators/public.decorator.ts` |
| OS secure storage (desktop) | ⚠️ | Токены в `localStorage`, не keychain — `baseApi.ts`, `authSlice.ts` |
| Роль guest | ⚠️ | Есть в seed и fallback `roleName: 'guest'` — в ТЗ не описана |

### Backend

```
server/src/modules/AuthModule/
├── auth.controller.ts      # REST endpoints
├── auth.service.ts         # login, register, refresh, logout, Google
├── auth.module.ts
├── dto/login.dto.ts
├── dto/register.dto.ts
├── guards/jwt-auth.guard.ts
├── guards/roles.guard.ts
├── strategies/jwt.strategy.ts
├── strategies/google.strategy.ts
└── types/auth.types.ts
```

### Frontend / Electron

| Компонент | Путь |
|---|---|
| Login | `frontend/src/components/Auth/Login.tsx` |
| Register | `frontend/src/components/Auth/Register.tsx` |
| OAuth callback | `frontend/src/components/Auth/AuthCallback.tsx` |
| Protected routes | `frontend/src/components/Auth/ProtectedRoute.tsx` |
| Auth state (Redux) | `frontend/src/store/slices/authSlice.ts` |
| Electron (аналог) | `electron-opus/src/renderer/src/components/Auth/` |

### БД

| Таблица | Файл модели |
|---|---|
| `Users` | `server/src/drizzle/models/auth.model.ts` |
| `Roles` | `server/src/drizzle/models/auth.model.ts` |
| `RefreshTokens` | `server/src/drizzle/models/auth.model.ts` |

## Поток входа

```mermaid
sequenceDiagram
  participant UI as Login.tsx
  participant API as POST /auth/login
  participant Auth as AuthService
  participant Redis as Redis
  participant DB as PostgreSQL

  UI->>API: email + password
  API->>Auth: validateUser()
  Auth->>Redis: check login_fail:{email}
  Auth->>DB: SELECT Users WHERE email
  Auth->>Auth: bcrypt.compare()
  Auth->>Redis: del fail key (success)
  Auth->>Auth: sign JWT 15m + refresh 7d
  Auth-->>UI: access_token, refresh_token, user
  UI->>UI: localStorage.setItem tokens
```

## Пробелы

- [ ] Хранение токенов в OS keychain для Electron (сейчас `localStorage`)
- [ ] Явная блокировка access token при logout (сейчас только refresh удаляется; access живёт до истечения 15 мин)
- [ ] Роль `guest` не описана в ТЗ — решить, нужна ли
