# ФТ-2: Управление пользователями и профилями

Источник: [FUNCTIONAL_REQUIREMENTS.md](../FUNCTIONAL_REQUIREMENTS.md) §2.3.2

## Требование

Ведение базы пользователей: CRUD для admin/manager, редактирование профиля, паспортные данные, несколько авто на аккаунт, история заказов, баллы лояльности.

## Реализация

| Возможность | Статус | Где |
|---|---|---|
| Admin: создать / редактировать / удалить | ✅ | `POST/PUT/DELETE /api/v1.0/users` — `@Roles('admin')` на delete |
| Manager: просмотр и редактирование | ✅ | `PUT /api/v1.0/users/:id` — `@Roles('admin', 'manager')` |
| Самостоятельное редактирование профиля | ✅ | `PUT /api/v1.0/users/profile/me` — `UpdateProfileDto` |
| Паспорт (документ, дата рожд., пол) | ✅ | Таблица `Passport` — `auth.model.ts`; создаётся при регистрации |
| Несколько авто на клиента | ✅ | `VehicleModule` — `GET/POST /api/v1.0/vehicle` |
| История заказов по авто | ✅ | `OrderModule` — заказы связаны с `userId` + `carId` |
| Баллы лояльности в профиле | ✅ | `GET /api/v1.0/promotions/loyalty/my` — `LoyaltyPage.tsx` |
| Блокировка учётной записи | ✅ | `Users.isBlocked` — admin через `PUT /users/:id`; проверка при login/JWT |
| Фото профиля | ✅ | `Users.avatarUrl` — upload через `StorageModule` + `Profile.tsx` |
| Пробег автомобиля | ✅ | `DiagnosticSessions.mileage` — только при диагностике (FT-11) |

### Backend

```
server/src/modules/UserModule/
├── user.controller.ts    # CRUD + profile/me
├── user.service.ts
├── Dto/create-user.dto.ts
├── Dto/update-user.dto.ts
├── Dto/update-profile.dto.ts
└── Dto/UserResponseDto.ts

server/src/modules/VehicleModule/
├── vehicle.controller.ts
└── vehicle.service.ts
```

**Ключевые endpoints:**

| Method | Path | Роли |
|---|---|---|
| GET | `/api/v1.0/users` | Public (список) |
| GET | `/api/v1.0/users/:id` | Public |
| POST | `/api/v1.0/users` | Public (регистрация) |
| PUT | `/api/v1.0/users/:id` | admin, manager |
| DELETE | `/api/v1.0/users/:id` | admin |
| GET | `/api/v1.0/users/profile/me` | auth |
| PUT | `/api/v1.0/users/profile/me` | auth |

### Frontend

| Компонент | Путь |
|---|---|
| Список пользователей | `frontend/src/components/UserComponents/UserList/UserList.tsx` |
| Карточка пользователя | `frontend/src/components/UserComponents/UserDetailed/UserDetailed.tsx` |
| Профиль (свой) | `frontend/src/components/UserComponents/Profile/Profile.tsx` |
| Редактирование | `frontend/src/widgets/EditUserModal/EditUserModal.tsx` |
| Автомобили | `frontend/src/components/VehicleComponents/VehiclesPage.tsx` |
| API | `frontend/src/api/usersApi.ts`, `vehiclesApi.ts` |

### БД

| Таблица | Назначение |
|---|---|
| `Users` | login, name, surName, email, phone, roleId, avatarUrl, isBlocked |
| `Passport` | identityNumber, birthDate, gender |
| `Cars` | brand, model, year, vin, licensePlate, userId |
| `Orders` | история заказов по userId / carId |
| `LoyaltyPrograms` | points, tier |

## Тест-кейсы

### TC-2.1 Admin: CRUD пользователей

**Роль:** admin (`admin@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `GET /api/v1.0/users` | 200, список пользователей |
| 2 | `POST /api/v1.0/users` с email, login, roleId | 201, пользователь создан |
| 3 | `PUT /api/v1.0/users/:id` — изменить phone | 200, phone обновлён |
| 4 | `DELETE /api/v1.0/users/:id` | 204, пользователь удалён |

### TC-2.2 Самостоятельное редактирование профиля

**Роль:** customer (`user1@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `GET /api/v1.0/users/profile/me` | 200, name, email, phone, avatarUrl |
| 2 | `PUT /api/v1.0/users/profile/me` — изменить name | 200, name обновлён |
| 3 | `GET /api/v1.0/vehicle` | 200, список авто текущего пользователя |
| 4 | `POST /api/v1.0/vehicle` с brand, model, vin | 201, авто привязано к userId |

### TC-2.3 Блокировка учётной записи

**Роль:** admin + customer

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | Admin: `PUT /api/v1.0/users/:id` с `isBlocked: true` для user1 | 200 |
| 2 | user1: `POST /auth/login` | 401 «Account is blocked» |
| 3 | Admin: снять блокировку `isBlocked: false` | 200 |
| 4 | user1: повторный login | 200, токены выданы |

## Пробелы

- [x] Блокировка пользователя admin-ом
- [x] Загрузка и отображение фото профиля
- [x] Пробег — через диагностику (`DiagnosticSessions.mileage`), не в `Cars`
