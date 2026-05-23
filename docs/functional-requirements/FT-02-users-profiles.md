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
| Пробег автомобиля | ✅ | `Cars.mileage` — `VehicleModule`, `Profile.tsx`, `VehiclesPage.tsx` |

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
| `Cars` | brand, model, year, vin, licensePlate, userId, mileage |
| `Orders` | история заказов по userId / carId |
| `LoyaltyPrograms` | points, tier |

## Пробелы

- [x] Блокировка пользователя admin-ом
- [x] Загрузка и отображение фото профиля
- [x] Пробег автомобиля (`Cars.mileage`)
