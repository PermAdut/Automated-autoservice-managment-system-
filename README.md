# Automated AutoService Management System

Полнофункциональная система управления автосервисом: клиенты, заказы, сотрудники, склад, диагностика, гарантии, программа лояльности, корпоративные клиенты, филиалы, аналитика.

**Стек:** NestJS · Drizzle ORM · PostgreSQL · Redis · BullMQ · React · Vite · Tailwind CSS · RTK Query · Socket.io

---

## Требования

| Инструмент | Версия |
|---|---|
| Node.js | ≥ 20 |
| npm | ≥ 10 |
| PostgreSQL | ≥ 15 |
| Redis | ≥ 7 (опционально — для брутфорс-защиты и очередей) |

---

## Быстрый старт

### 1. Клонировать репозиторий

```bash
git clone <repo-url>
cd Automated-autoservice-managment-system-
```

### 2. Настроить переменные окружения сервера

```bash
cp server/.env.example server/.env
```

Открыть `server/.env` и заполнить обязательные поля:

```env
# База данных
DB_HOST=localhost
DB_PORT=5432
DB_NAME=autoservice_db
DB_USER=postgres
DB_PASSWORD=your_password

DATABASE_URL=postgresql://postgres:your_password@localhost:5432/autoservice_db

# JWT — сгенерировать: openssl rand -hex 64
JWT_SECRET=your_long_secret_here

# URL фронтенда (для CORS и OAuth-редиректов)
FRONTEND_URL=http://localhost:5173
```

Остальные параметры (AWS S3, SMTP, Google OAuth, Redis) — опциональны для локальной разработки.

### 3. Создать базу данных

```bash
psql -U postgres -c "CREATE DATABASE autoservice_db;"
```

### 4. Установить зависимости и применить миграции

```bash
cd server
npm install
npm run db:push        # применить схему к БД (для разработки)
# или npm run db:migrate  # запустить SQL-миграции (для продакшена)
```

Опционально — заполнить тестовыми данными:

```bash
npm run db:seed
```

### 5. Запустить сервер

```bash
# режим разработки с авто-перезагрузкой
npm run start:dev
```

Сервер поднимается на **http://localhost:3000**  
Swagger UI: **http://localhost:3000/api/docs**

### 6. Установить зависимости и запустить фронтенд

```bash
cd ../frontend
npm install
npm run dev
```

Фронтенд открывается на **http://localhost:5173**

---

## Структура проекта

```
.
├── server/                  # NestJS backend
│   ├── src/
│   │   ├── modules/         # Бизнес-модули (Auth, Order, Employee, …)
│   │   ├── drizzle/         # Схема БД и модели (Drizzle ORM)
│   │   └── main.ts          # Точка входа
│   ├── .env.example         # Шаблон переменных окружения
│   └── package.json
│
├── frontend/                # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── api/             # RTK Query эндпоинты
│   │   ├── components/      # UI-компоненты по модулям
│   │   ├── store/           # Redux store + slices
│   │   ├── hooks/           # Хуки (сеть, офлайн-статус)
│   │   └── offline/         # IndexedDB очередь синхронизации
│   └── package.json
│
└── docs/                    # Документация (требования, обзор проекта)
```

---

## Полезные команды

### Сервер (`cd server`)

```bash
npm run start:dev        # dev-режим с hot-reload
npm run build            # production-сборка
npm run start:prod       # запуск prod-сборки

npm run db:generate      # сгенерировать новую миграцию из схемы
npm run db:migrate       # применить миграции
npm run db:push          # push схемы без миграций (dev only)
npm run db:studio        # открыть Drizzle Studio (GUI для БД)
npm run db:seed          # заполнить БД тестовыми данными
```

### Фронтенд (`cd frontend`)

```bash
npm run dev              # dev-сервер (Vite)
npm run build            # production-сборка
npm run preview          # превью production-сборки
npm run lint             # проверка кода
```

---

## Основные модули

| Модуль | Путь API | Описание |
|---|---|---|
| Auth | `/auth` | Регистрация, вход, JWT, Google OAuth, refresh-токены |
| Users | `/api/v1.0/users` | Управление пользователями и профилями |
| Employees | `/api/v1.0/employee` | Сотрудники, должности, расписание, отзывы |
| Orders | `/api/v1.0/orders` | Заказы, услуги, запчасти |
| Booking | `/booking` | Онлайн-запись, временные слоты |
| Vehicle | `/vehicle` | Автомобили клиентов, VIN-декодер |
| Diagnostics | `/diagnostics` | Диагностические сессии, DTC-коды, ТО-напоминания |
| Warranty | `/warranty` | Гарантийные обязательства, обращения, PDF-талон |
| Loyalty | `/promotions` | Программа лояльности, скидки, баллы |
| Branches | `/branches` | Филиалы, сотрудники по филиалам, складские переводы |
| Corporate | `/corporate` | Корпоративные клиенты, договоры |
| Partners | `/partners` | Партнёрская сеть, API-ключи, перенаправления |
| Schedule | `/schedule` | Оптимизация постов, диаграмма Ганта |
| Reports | `/api/v1.0/reports` | Аналитические отчёты, экспорт CSV/PDF |
| Notifications | `/notifications` | Email, in-app, шаблоны, каналы |
| Tenant | `/tenant` | White-label настройки, страницы |

---

## Переменные окружения — полный список

Все переменные с описаниями находятся в `server/.env.example`.  
Обязательные для локального запуска: `DB_*`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`.  
Остальные (S3, Redis, SMTP, Google OAuth) — опциональны.

---

## Первый вход в систему

После `npm run db:seed` создаётся тестовый admin-пользователь:

```
Email:    admin@autoservice.ru
Password: Admin1234!
```

> Смените пароль после первого входа через страницу профиля.

---

## Swagger API

Доступен по адресу **http://localhost:3000/api/docs** в режиме `NODE_ENV=development`.  
Для авторизации: нажать **Authorize** → вставить `Bearer <access_token>` из ответа `/auth/login`.
