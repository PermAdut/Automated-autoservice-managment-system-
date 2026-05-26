import { DatabaseService } from '../modules/database/database.service';
import {
  users, roles, employees, positions, services, serviceCategories,
  suppliers, categories, spareParts, stores, sparePartStore,
  cars, orders, servicesOrders, sparePartOrders, payments,
  workSchedules, subscriptions, reviews, positionsForBuying,
  workTypes, employeeQualifications,
  invoices, passports, branches, branchEmployees, storeTransfers,
  appointments, timeSlots, discounts, orderDiscounts,
  loyaltyPrograms, loyaltyTransactions,
  warranties, warrantyClaims,
  companies, companyContracts, companyCars, companyDrivers,
  tenantSettings, productionPosts, stockMovements, syncLog,
  diagnosticSessions, maintenanceReminders,
} from '../drizzle/schema';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

const FIRST_NAMES_M = ['Александр', 'Дмитрий', 'Иван', 'Михаил', 'Андрей', 'Алексей', 'Сергей', 'Николай', 'Артём', 'Роман', 'Евгений', 'Владимир', 'Илья', 'Кирилл', 'Павел', 'Тимур', 'Максим', 'Антон', 'Данила', 'Егор'];
const FIRST_NAMES_F = ['Анна', 'Мария', 'Елена', 'Ольга', 'Наталья', 'Татьяна', 'Ирина', 'Светлана', 'Юлия', 'Екатерина', 'Алина', 'Виктория', 'Ксения', 'Дарья', 'Полина', 'Валерия', 'Надежда', 'Людмила', 'Вера', 'Галина'];
const LAST_NAMES = ['Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов', 'Новиков', 'Федоров', 'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семенов', 'Егоров', 'Павлов', 'Козлов', 'Степанов', 'Николаев', 'Орлов', 'Андреев', 'Макаров', 'Никитин', 'Захаров'];
const LAST_NAMES_F = ['Иванова', 'Смирнова', 'Кузнецова', 'Попова', 'Васильева', 'Петрова', 'Соколова', 'Михайлова', 'Новикова', 'Федорова', 'Морозова', 'Волкова', 'Алексеева', 'Лебедева', 'Семенова', 'Егорова', 'Павлова', 'Козлова', 'Степанова', 'Николаева'];

const CAR_MODELS = [
  { brand: 'Toyota', models: ['Camry', 'Corolla', 'RAV4', 'Land Cruiser', 'Highlander'] },
  { brand: 'BMW', models: ['X5', 'X3', '5 Series', '3 Series', 'X6'] },
  { brand: 'Mercedes-Benz', models: ['E-Class', 'C-Class', 'GLE', 'S-Class', 'A-Class'] },
  { brand: 'Audi', models: ['A4', 'A6', 'Q5', 'Q7', 'A3'] },
  { brand: 'Volkswagen', models: ['Passat', 'Tiguan', 'Golf', 'Polo', 'Touareg'] },
  { brand: 'Kia', models: ['Sportage', 'Sorento', 'Rio', 'Ceed', 'K5'] },
  { brand: 'Hyundai', models: ['Tucson', 'Santa Fe', 'Solaris', 'Elantra', 'Creta'] },
  { brand: 'Nissan', models: ['X-Trail', 'Qashqai', 'Pathfinder', 'Murano', 'Almera'] },
  { brand: 'Lada', models: ['Vesta', 'Granta', 'Niva', 'XRAY', 'Largus'] },
  { brand: 'Skoda', models: ['Octavia', 'Superb', 'Karoq', 'Kodiaq', 'Rapid'] },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickIdx<T>(arr: T[], idx: number): T {
  return arr[idx % arr.length];
}

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pastDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function futureDate(daysAhead: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d;
}

function scheduleDayAt(dayOffset: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function seed() {
  const dbService = new DatabaseService();

  try {
    console.log('Clearing tables...');

    // Clear in FK-safe order
    await dbService.db.delete(syncLog);
    await dbService.db.delete(stockMovements);
    await dbService.db.delete(loyaltyTransactions);
    await dbService.db.delete(loyaltyPrograms);
    await dbService.db.delete(orderDiscounts);
    await dbService.db.delete(discounts);
    await dbService.db.delete(warrantyClaims);
    await dbService.db.delete(warranties);
    await dbService.db.delete(companyDrivers);
    await dbService.db.delete(companyCars);
    await dbService.db.delete(companyContracts);
    await dbService.db.delete(companies);
    await dbService.db.delete(maintenanceReminders);
    await dbService.db.delete(diagnosticSessions);
    await dbService.db.delete(invoices);
    await dbService.db.delete(positionsForBuying);
    await dbService.db.delete(storeTransfers);
    await dbService.db.delete(branchEmployees);
    await dbService.db.delete(appointments);
    await dbService.db.delete(timeSlots);
    await dbService.db.delete(reviews);
    await dbService.db.delete(subscriptions);
    await dbService.db.delete(employeeQualifications);
    await dbService.db.delete(workSchedules);
    await dbService.db.delete(sparePartStore);
    await dbService.db.delete(servicesOrders);
    await dbService.db.delete(sparePartOrders);
    await dbService.db.delete(payments);
    await dbService.db.delete(orders);
    await dbService.db.delete(productionPosts);
    await dbService.db.delete(cars);
    await dbService.db.delete(passports);
    await dbService.db.delete(spareParts);
    await dbService.db.delete(stores);
    await dbService.db.delete(categories);
    await dbService.db.delete(services);
    await dbService.db.delete(serviceCategories);
    await dbService.db.delete(workTypes);
    await dbService.db.delete(employees);
    await dbService.db.delete(positions);
    await dbService.db.delete(suppliers);
    // Break circular Users <-> Branches FK before delete
    await dbService.db.update(users).set({ branchId: null });
    await dbService.db.update(branches).set({ managerId: null });
    await dbService.db.delete(branches);
    await dbService.db.delete(users);
    await dbService.db.delete(roles);
    await dbService.db.delete(tenantSettings);

    // ── Tenant ────────────────────────────────────────────────────────────────
    console.log('Seeding tenant...');
    const [tenant] = await dbService.db.insert(tenantSettings).values({
      companyName: 'АвтоСервис Про',
      tagline: 'Надёжный партнёр на дороге',
      description: 'Сеть современных автосервисов в Беларуси. Качественный ремонт, честные цены.',
      primaryColor: '#1d4ed8',
      secondaryColor: '#0ea5e9',
      accentColor: '#10b981',
      address: 'г. Минск, пр-т Независимости, 95',
      city: 'Минск',
      country: 'BY',
      phone: '+375-17-200-00-01',
      email: 'info.avtoservis@gmail.com',
      website: 'https://avtoservis.pro',
      workingHours: 'Пн-Сб: 9:00-21:00, Нд: 10:00-18:00',
      currency: 'BYN',
      timezone: 'Europe/Minsk',
      language: 'ru',
      featureOnlineBooking: true,
      featureVinDecoder: true,
      featureLoyaltyProgram: true,
      featurePartnerNetwork: true,
      featureMultiBranch: true,
      featureCorporateClients: true,
      featureEmailNotifications: true,
      loyaltyPointsPerRub: '0.1',
      loyaltyMaxSpendPercent: 20,
      isSetupComplete: true,
      setupCompletedAt: pastDate(90),
    }).returning();

    // ── Roles ─────────────────────────────────────────────────────────────────
    console.log('Seeding roles...');
    const [guestRole] = await dbService.db.insert(roles).values({ name: 'guest' }).returning();
    const [adminRole] = await dbService.db.insert(roles).values({ name: 'admin' }).returning();
    const [managerRole] = await dbService.db.insert(roles).values({ name: 'manager' }).returning();
    const [customerRole] = await dbService.db.insert(roles).values({ name: 'customer' }).returning();
    void guestRole;

    // ── Users ─────────────────────────────────────────────────────────────────
    console.log('Seeding users (200)...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const usersToInsert: typeof users.$inferInsert[] = [];

    // Admin
    usersToInsert.push({
      login: 'admin', name: 'Администратор', surName: 'Системный',
      email: 'admin@gmail.com', phone: '+375291000001',
      passwordHash, roleId: adminRole.id, tenantId: tenant.id,
      avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff',
      isBlocked: false,
    });

    // 4 managers
    const managerLogins = ['manager1', 'manager2', 'manager3', 'manager4'];
    const managerNames = [
      { name: 'Олег', surName: 'Карпов' },
      { name: 'Наталья', surName: 'Симонова' },
      { name: 'Виктор', surName: 'Глинский' },
      { name: 'Людмила', surName: 'Ходасевич' },
    ];
    for (let i = 0; i < 4; i++) {
      usersToInsert.push({
        login: managerLogins[i],
        name: managerNames[i].name,
        surName: managerNames[i].surName,
        email: `${managerLogins[i]}@gmail.com`,
        phone: `+37529100000${i + 2}`,
        passwordHash,
        roleId: managerRole.id,
        tenantId: tenant.id,
        isBlocked: false,
      });
    }

    // 195 customers
    let phoneCounter = 100;
    for (let i = 0; i < 195; i++) {
      const isFemale = i % 3 === 0;
      const firstName = isFemale ? pickIdx(FIRST_NAMES_F, i) : pickIdx(FIRST_NAMES_M, i);
      const lastName = isFemale ? pickIdx(LAST_NAMES_F, i) : pickIdx(LAST_NAMES, i);
      const login = `user${i + 1}`;
      phoneCounter++;
      usersToInsert.push({
        login,
        name: firstName,
        surName: lastName,
        email: `${login}@gmail.com`,
        phone: `+37544${phoneCounter.toString().padStart(7, '0')}`,
        passwordHash,
        roleId: customerRole.id,
        tenantId: tenant.id,
        isBlocked: i === 2 || i === 7,
        avatarUrl: i < 5
          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + '+' + lastName)}&background=random`
          : undefined,
      });
    }

    const createdUsers = await dbService.db.insert(users).values(usersToInsert).returning();
    const adminUser = createdUsers[0];
    const managerUsers = createdUsers.slice(1, 5);
    const customerUsers = createdUsers.slice(5);

    // FT-9: dedicated user to demo predictive maintenance recommendations
    console.log('Seeding predictive maintenance demo user...');
    const [predictDemoUser] = await dbService.db.insert(users).values({
      login: 'predictdemo',
      name: 'Дмитрий',
      surName: 'Автов',
      email: 'predict.demo@gmail.com',
      phone: '+375291009999',
      passwordHash,
      roleId: customerRole.id,
      tenantId: tenant.id,
      isBlocked: false,
      avatarUrl: 'https://ui-avatars.com/api/?name=Dmitry+Autov&background=0ea5e9&color=fff',
    }).returning();

    const PREDICT_DEMO_MILEAGE = {
      current: 82600,
      lastOilService: 73000,
      lastTireRotation: 68000,
      lastBrakeService: 53000,
      lastScheduledMaintenance: 62000,
    };

    // ── Passports ─────────────────────────────────────────────────────────────
    console.log('Seeding passports...');
    const passportsToInsert = customerUsers.slice(0, 100).map((u, i) => ({
      userId: u.id,
      identityNumber: `${4500 + i} ${600000 + i * 7}`,
      birthDate: new Date(1980 + (i % 25), i % 12, (i % 28) + 1),
      gender: (i % 3 === 0 ? 'F' : 'M'),
      tenantId: tenant.id,
    }));
    await dbService.db.insert(passports).values(passportsToInsert as typeof passports.$inferInsert[]);
    await dbService.db.insert(passports).values({
      userId: predictDemoUser.id,
      identityNumber: '4510 999001',
      birthDate: new Date(1988, 4, 12),
      gender: 'M',
      tenantId: tenant.id,
    });

    // ── Positions ─────────────────────────────────────────────────────────────
    console.log('Seeding positions...');
    const positionsData = [
      { name: 'Автомеханик', description: 'Слесарный ремонт автомобилей' },
      { name: 'Автоэлектрик', description: 'Диагностика и ремонт электросистем' },
      { name: 'Мастер-приёмщик', description: 'Приём и выдача автомобилей' },
      { name: 'Технический директор', description: 'Руководство технической службой' },
      { name: 'Кузовщик', description: 'Кузовной ремонт и покраска' },
      { name: 'Шиномонтажник', description: 'Шиномонтаж и балансировка' },
      { name: 'Диагност', description: 'Компьютерная диагностика' },
      { name: 'Администратор', description: 'Административная работа' },
    ];
    const createdPositions = await dbService.db.insert(positions).values(
      positionsData.map(p => ({ ...p, tenantId: tenant.id }))
    ).returning();

    // ── Employees ─────────────────────────────────────────────────────────────
    console.log('Seeding employees (25)...');
    const employeeNames = [
      { name: 'Антон', surName: 'Громов', lastName: 'Игоревич' },
      { name: 'Мария', surName: 'Сидорова', lastName: 'Андреевна' },
      { name: 'Дмитрий', surName: 'Семенов', lastName: 'Петрович' },
      { name: 'Юлия', surName: 'Орлова', lastName: 'Викторовна' },
      { name: 'Владислав', surName: 'Козлов', lastName: 'Николаевич' },
      { name: 'Алина', surName: 'Воронова', lastName: 'Игоревна' },
      { name: 'Сергей', surName: 'Белов', lastName: 'Александрович' },
      { name: 'Ирина', surName: 'Тихонова', lastName: 'Олеговна' },
      { name: 'Вадим', surName: 'Крылов', lastName: 'Михайлович' },
      { name: 'Наталья', surName: 'Зубова', lastName: 'Сергеевна' },
      { name: 'Илья', surName: 'Фёдоров', lastName: 'Дмитриевич' },
      { name: 'Екатерина', surName: 'Макарова', lastName: 'Ивановна' },
      { name: 'Роман', surName: 'Захаров', lastName: 'Валерьевич' },
      { name: 'Светлана', surName: 'Кириллова', lastName: 'Петровна' },
      { name: 'Артём', surName: 'Шестаков', lastName: 'Олегович' },
      { name: 'Анастасия', surName: 'Лазарева', lastName: 'Юрьевна' },
      { name: 'Никита', surName: 'Поляков', lastName: 'Алексеевич' },
      { name: 'Ольга', surName: 'Быкова', lastName: 'Николаевна' },
      { name: 'Евгений', surName: 'Соловьёв', lastName: 'Владимирович' },
      { name: 'Людмила', surName: 'Жукова', lastName: 'Ивановна' },
      { name: 'Максим', surName: 'Денисов', lastName: 'Андреевич' },
      { name: 'Тамара', surName: 'Рыжова', lastName: 'Степановна' },
      { name: 'Кирилл', surName: 'Мартынов', lastName: 'Валентинович' },
      { name: 'Валентина', surName: 'Першина', lastName: 'Васильевна' },
      { name: 'Павел', surName: 'Щербаков', lastName: 'Геннадьевич' },
    ];
    const salaries = [45000, 48000, 55000, 60000, 65000, 52000, 50000, 47000];
    const employeesToInsert = employeeNames.map((e, i) => ({
      ...e,
      positionId: createdPositions[i % createdPositions.length].id,
      userId: i < managerUsers.length ? managerUsers[i].id : undefined,
      hireDate: pastDate(rnd(30, 1800)),
      salary: salaries[i % salaries.length].toString(),
      tenantId: tenant.id,
    }));
    const createdEmployees = await dbService.db.insert(employees).values(employeesToInsert).returning();

    // ── Work Types (qualification matrix) ─────────────────────────────────────
    console.log('Seeding work types...');
    const workTypesData = [
      { name: 'Слесарные работы', description: 'ТО, двигатель, базовый ремонт' },
      { name: 'Диагностика', description: 'Компьютерная и механическая диагностика' },
      { name: 'Тормозная система', description: 'Ремонт и обслуживание тормозов' },
      { name: 'Подвеска и рулевое', description: 'Ходовая часть, развал-схождение' },
      { name: 'Автоэлектрика', description: 'Электрооборудование и проводка' },
      { name: 'Кузовной ремонт', description: 'Кузов, покраска, рихтовка' },
      { name: 'Шиномонтаж', description: 'Шины, балансировка, проколы' },
    ];
    const createdWorkTypes = await dbService.db.insert(workTypes).values(
      workTypesData.map(item => ({ ...item, tenantId: tenant.id })),
    ).returning();

    console.log('Seeding employee qualifications...');
    const qualificationLevels = [3, 4, 5, 2, 4, 3, 5, 2, 4, 3];
    const qualificationsToInsert: typeof employeeQualifications.$inferInsert[] = [];
    for (let i = 0; i < createdEmployees.length; i++) {
      const emp = createdEmployees[i];
      const primaryType = createdWorkTypes[i % createdWorkTypes.length];
      qualificationsToInsert.push({
        employeeId: emp.id,
        workTypeId: primaryType.id,
        level: qualificationLevels[i % qualificationLevels.length],
        tenantId: tenant.id,
      });
      if (i % 2 === 0) {
        const secondaryType = createdWorkTypes[(i + 1) % createdWorkTypes.length];
        qualificationsToInsert.push({
          employeeId: emp.id,
          workTypeId: secondaryType.id,
          level: Math.max(1, qualificationLevels[i % qualificationLevels.length] - 1),
          tenantId: tenant.id,
        });
      }
    }
    await dbService.db.insert(employeeQualifications).values(qualificationsToInsert);

    const masterCountForDemo = Math.min(10, createdEmployees.length);
    const demoWorkTypeId = createdWorkTypes[0].id;
    const extraQualifications: typeof employeeQualifications.$inferInsert[] = [];
    for (let i = 0; i < masterCountForDemo; i++) {
      const empId = createdEmployees[i].id;
      const alreadyHas = qualificationsToInsert.some(
        q => q.employeeId === empId && q.workTypeId === demoWorkTypeId,
      );
      if (!alreadyHas) {
        extraQualifications.push({
          employeeId: empId,
          workTypeId: demoWorkTypeId,
          level: 3,
          tenantId: tenant.id,
        });
      }
    }
    if (extraQualifications.length > 0) {
      await dbService.db.insert(employeeQualifications).values(extraQualifications);
    }

    // ── Work Schedules ────────────────────────────────────────────────────────
    console.log('Seeding work schedules...');
    const workSchedulesToInsert: typeof workSchedules.$inferInsert[] = [];
    for (const emp of createdEmployees) {
      for (let week = 0; week < 8; week++) {
        for (let day = 0; day < 5; day++) {
          const base = pastDate(week * 7 - day);
          base.setHours(9, 0, 0, 0);
          const end = new Date(base);
          end.setHours(18, 0, 0, 0);
          workSchedulesToInsert.push({
            employeeId: emp.id,
            startTime: base,
            endTime: end,
            isAvailable: day < 4,
            tenantId: tenant.id,
          });
        }
      }
    }
    // Current week — for Gantt chart & schedule optimization demo
    for (const emp of createdEmployees) {
      for (const dayOffset of [0, 1, 2, 3]) {
        const start = scheduleDayAt(dayOffset, 8);
        const end = scheduleDayAt(dayOffset, 20);
        workSchedulesToInsert.push({
          employeeId: emp.id,
          startTime: start,
          endTime: end,
          isAvailable: true,
          tenantId: tenant.id,
        });
      }
    }
    await dbService.db.insert(workSchedules).values(workSchedulesToInsert);

    // ── Service Categories ────────────────────────────────────────────────────
    console.log('Seeding service categories...');
    const rootCats = await dbService.db.insert(serviceCategories).values([
      { name: 'Техническое обслуживание', description: 'Плановое ТО и замена расходников', tenantId: tenant.id },
      { name: 'Диагностика', description: 'Компьютерная и ручная диагностика', tenantId: tenant.id },
      { name: 'Двигатель', description: 'Ремонт и обслуживание двигателя', tenantId: tenant.id },
      { name: 'Тормозная система', description: 'Тормоза и тормозные механизмы', tenantId: tenant.id },
      { name: 'Подвеска и рулевое', description: 'Ходовая часть и рулевое управление', tenantId: tenant.id },
      { name: 'Электрика', description: 'Электрооборудование автомобиля', tenantId: tenant.id },
      { name: 'Кузовной ремонт', description: 'Кузов, покраска, антикор', tenantId: tenant.id },
      { name: 'Шиномонтаж', description: 'Шины, диски, балансировка', tenantId: tenant.id },
    ]).returning();

    // Sub-categories
    await dbService.db.insert(serviceCategories).values([
      { name: 'ТО-1', description: '10 000 км', parentId: rootCats[0].id, tenantId: tenant.id },
      { name: 'ТО-2', description: '20 000 км', parentId: rootCats[0].id, tenantId: tenant.id },
      { name: 'ТО-3', description: '30 000 км', parentId: rootCats[0].id, tenantId: tenant.id },
      { name: 'Компьютерная диагностика', parentId: rootCats[1].id, tenantId: tenant.id },
      { name: 'Диагностика АКПП', parentId: rootCats[1].id, tenantId: tenant.id },
    ]);

    // ── Services ──────────────────────────────────────────────────────────────
    console.log('Seeding services...');
    const servicesData = [
      { name: 'Замена масла двигателя', price: 1200, dur: 60, catIdx: 0 },
      { name: 'Замена воздушного фильтра', price: 400, dur: 30, catIdx: 0 },
      { name: 'Замена топливного фильтра', price: 600, dur: 45, catIdx: 0 },
      { name: 'Замена свечей зажигания', price: 900, dur: 60, catIdx: 0 },
      { name: 'Замена ремня ГРМ', price: 4500, dur: 180, catIdx: 0 },
      { name: 'Компьютерная диагностика двигателя', price: 800, dur: 60, catIdx: 1 },
      { name: 'Диагностика тормозной системы', price: 500, dur: 45, catIdx: 1 },
      { name: 'Диагностика подвески', price: 700, dur: 60, catIdx: 1 },
      { name: 'Диагностика АКПП', price: 1200, dur: 90, catIdx: 1 },
      { name: 'Замена прокладки головки блока', price: 8000, dur: 300, catIdx: 2 },
      { name: 'Ремонт топливной системы', price: 3500, dur: 120, catIdx: 2 },
      { name: 'Чистка инжектора', price: 2400, dur: 90, catIdx: 2 },
      { name: 'Замена тормозных колодок (передние)', price: 1500, dur: 60, catIdx: 3 },
      { name: 'Замена тормозных колодок (задние)', price: 1500, dur: 60, catIdx: 3 },
      { name: 'Замена тормозных дисков', price: 3200, dur: 90, catIdx: 3 },
      { name: 'Прокачка тормозной системы', price: 800, dur: 60, catIdx: 3 },
      { name: 'Замена амортизаторов передних', price: 4500, dur: 120, catIdx: 4 },
      { name: 'Замена амортизаторов задних', price: 4000, dur: 120, catIdx: 4 },
      { name: 'Замена рулевых тяг', price: 2800, dur: 90, catIdx: 4 },
      { name: 'Замена шаровых опор', price: 2500, dur: 90, catIdx: 4 },
      { name: 'Развал-схождение', price: 1800, dur: 60, catIdx: 4 },
      { name: 'Замена аккумулятора', price: 500, dur: 30, catIdx: 5 },
      { name: 'Ремонт генератора', price: 3500, dur: 150, catIdx: 5 },
      { name: 'Ремонт стартера', price: 3000, dur: 120, catIdx: 5 },
      { name: 'Замена проводки', price: 5000, dur: 240, catIdx: 5 },
      { name: 'Рихтовка кузова', price: 6000, dur: 300, catIdx: 6 },
      { name: 'Покраска бампера', price: 8000, dur: 480, catIdx: 6 },
      { name: 'Антикоррозийная обработка', price: 5500, dur: 240, catIdx: 6 },
      { name: 'Монтаж летних шин', price: 1200, dur: 60, catIdx: 7 },
      { name: 'Монтаж зимних шин', price: 1200, dur: 60, catIdx: 7 },
      { name: 'Балансировка колёс', price: 800, dur: 45, catIdx: 7 },
      { name: 'Ремонт прокола', price: 400, dur: 30, catIdx: 7 },
    ];
    const serviceWorkTypeByCategory = [
      createdWorkTypes[0].id,
      createdWorkTypes[1].id,
      createdWorkTypes[0].id,
      createdWorkTypes[2].id,
      createdWorkTypes[3].id,
      createdWorkTypes[4].id,
      createdWorkTypes[5].id,
      createdWorkTypes[6].id,
    ];
    const serviceRequiredLevels = [2, 3, 4, 2, 3, 4, 3, 2];
    const createdServices = await dbService.db.insert(services).values(
      servicesData.map(s => ({
        name: s.name,
        description: s.name,
        price: s.price,
        durationMinutes: String(s.dur),
        isActive: true,
        categoryId: rootCats[s.catIdx].id,
        workTypeId: serviceWorkTypeByCategory[s.catIdx],
        requiredQualificationLevel: serviceRequiredLevels[s.catIdx],
        tenantId: tenant.id,
      }))
    ).returning();

    const optimizeDemoService =
      createdServices.find(
        s =>
          s.workTypeId === createdWorkTypes[0].id &&
          Number(s.requiredQualificationLevel) <= 2 &&
          Number(s.durationMinutes) <= 60,
      ) ?? createdServices.find(s => Number(s.durationMinutes) <= 60)!;

    // ── Stores ────────────────────────────────────────────────────────────────
    console.log('Seeding stores...');
    const storeNames = [
      { name: 'Склад Центральный', location: 'Минск, пр-т Независимости, 95', phone: '+375171000001', workingHours: 'Пн-Пт 9-18' },
      { name: 'Склад Северный', location: 'Минск, пр-т Победителей, 23', phone: '+375171000002', workingHours: 'Пн-Пт 9-18' },
      { name: 'Склад Южный', location: 'Минск, ул. Притыцкого, 65', phone: '+375171000003', workingHours: 'Пн-Сб 9-17' },
      { name: 'Склад Гомель', location: 'Гомель, ул. Советская, 12', phone: '+375232000001', workingHours: 'Пн-Пт 9-18' },
      { name: 'Магазин запчастей', location: 'Минск, пр-т Машерова, 25', phone: '+375171000005', workingHours: 'Пн-Вс 9-20' },
    ];
    const createdStores = await dbService.db.insert(stores).values(
      storeNames.map(s => ({ ...s, tenantId: tenant.id }))
    ).returning();

    // ── Suppliers ─────────────────────────────────────────────────────────────
    console.log('Seeding suppliers...');
    const suppliersData = [
      { name: 'БелАвтоДеталь', contact: 'sales.belavtodetal@gmail.com', address: 'Минск, ул. Промышленная, 12' },
      { name: 'ПромАвто', contact: 'info.promavto@gmail.com', address: 'Гомель, пр-т Октябрьский, 45' },
      { name: 'TechParts BY', contact: 'orders.techparts@gmail.com', address: 'Брест, ул. Московская, 22' },
      { name: 'Феникс Авто', contact: 'fenix.feniksavto@gmail.com', address: 'Гродно, ул. Советская, 7' },
      { name: 'МегаЗапчасти', contact: 'mega.megazap@gmail.com', address: 'Минск, пр-т Партизанский, 118' },
      { name: 'AutoParts Pro BY', contact: 'pro.autopartspro@gmail.com', address: 'Могилёв, ул. Первомайская, 34' },
      { name: 'Бош Авто Сервис', contact: 'supply.bosch.as@gmail.com', address: 'Минск, ул. Немига, 11' },
      { name: 'ОригиналЗапчасти', contact: 'original.origzap@gmail.com', address: 'Витебск, ул. Ленина, 9' },
    ];
    const createdSuppliers = await dbService.db.insert(suppliers).values(
      suppliersData.map(s => ({ ...s, tenantId: tenant.id }))
    ).returning();

    // ── Spare part categories ─────────────────────────────────────────────────
    console.log('Seeding part categories...');
    const partCatsData = [
      { name: 'Масла и жидкости', description: 'Моторные масла, антифризы, тормозные жидкости' },
      { name: 'Фильтры', description: 'Масляные, воздушные, топливные фильтры' },
      { name: 'Тормозная система', description: 'Колодки, диски, суппорты' },
      { name: 'Подвеска', description: 'Амортизаторы, пружины, сайлентблоки' },
      { name: 'Электрика', description: 'Аккумуляторы, генераторы, стартеры' },
      { name: 'Двигатель', description: 'Прокладки, фильтры, свечи' },
      { name: 'Кузов', description: 'Бамперы, крылья, молдинги' },
      { name: 'Шины и диски', description: 'Летние и зимние шины, литые и штампованные диски' },
    ];
    const createdPartCats = await dbService.db.insert(categories).values(
      partCatsData.map(c => ({ ...c, tenantId: tenant.id }))
    ).returning();

    // ── Spare parts ───────────────────────────────────────────────────────────
    console.log('Seeding spare parts (50)...');
    const sparePartsData = [
      // Масла и жидкости
      { name: 'Масло моторное 5W-30 (4л)', partNumber: 'OIL-5W30-4L', price: '1890', catIdx: 0 },
      { name: 'Масло моторное 5W-40 (4л)', partNumber: 'OIL-5W40-4L', price: '1990', catIdx: 0 },
      { name: 'Масло трансмиссионное ATF (1л)', partNumber: 'OIL-ATF-1L', price: '650', catIdx: 0 },
      { name: 'Антифриз G12 (1л)', partNumber: 'COOL-G12-1L', price: '320', catIdx: 0 },
      { name: 'Жидкость тормозная DOT4 (0.5л)', partNumber: 'BRK-DOT4-05', price: '280', catIdx: 0 },
      // Фильтры
      { name: 'Фильтр масляный (универсальный)', partNumber: 'FLT-OIL-UNI', price: '380', catIdx: 1 },
      { name: 'Фильтр воздушный Toyota Camry', partNumber: 'FLT-AIR-CAM', price: '520', catIdx: 1 },
      { name: 'Фильтр воздушный BMW X5', partNumber: 'FLT-AIR-BMW', price: '890', catIdx: 1 },
      { name: 'Фильтр топливный (бензин)', partNumber: 'FLT-FUEL-GAS', price: '480', catIdx: 1 },
      { name: 'Фильтр салонный угольный', partNumber: 'FLT-CAB-COAL', price: '620', catIdx: 1 },
      // Тормозная система
      { name: 'Колодки тормозные передние (Toyota)', partNumber: 'BRK-PAD-TOY-F', price: '1250', catIdx: 2 },
      { name: 'Колодки тормозные задние (Toyota)', partNumber: 'BRK-PAD-TOY-R', price: '950', catIdx: 2 },
      { name: 'Диск тормозной передний (BMW)', partNumber: 'BRK-DSC-BMW-F', price: '3200', catIdx: 2 },
      { name: 'Диск тормозной задний (Kia)', partNumber: 'BRK-DSC-KIA-R', price: '2400', catIdx: 2 },
      { name: 'Суппорт тормозной левый', partNumber: 'BRK-CAL-L', price: '4500', catIdx: 2 },
      // Подвеска
      { name: 'Амортизатор передний (Hyundai)', partNumber: 'SUS-SHK-HYN-F', price: '3800', catIdx: 3 },
      { name: 'Амортизатор задний (Kia)', partNumber: 'SUS-SHK-KIA-R', price: '3200', catIdx: 3 },
      { name: 'Шаровая опора нижняя', partNumber: 'SUS-BALL-LW', price: '890', catIdx: 3 },
      { name: 'Рулевой наконечник правый', partNumber: 'SUS-TIE-R', price: '650', catIdx: 3 },
      { name: 'Сайлентблок передний', partNumber: 'SUS-BUSH-F', price: '420', catIdx: 3 },
      { name: 'Пружина подвески передняя', partNumber: 'SUS-SPR-F', price: '1850', catIdx: 3 },
      // Электрика
      { name: 'Аккумулятор 60Ah 12V', partNumber: 'EL-BAT-60', price: '5200', catIdx: 4 },
      { name: 'Аккумулятор 75Ah 12V', partNumber: 'EL-BAT-75', price: '6800', catIdx: 4 },
      { name: 'Генератор 90A', partNumber: 'EL-ALT-90', price: '9500', catIdx: 4 },
      { name: 'Стартер (Toyota)', partNumber: 'EL-STR-TOY', price: '7200', catIdx: 4 },
      { name: 'Свеча зажигания (комплект 4шт)', partNumber: 'EL-PLUG-4', price: '1200', catIdx: 5 },
      // Двигатель
      { name: 'Прокладка ГБЦ (Toyota 1AZ)', partNumber: 'ENG-GSK-1AZ', price: '2800', catIdx: 5 },
      { name: 'Комплект ГРМ (BMW N52)', partNumber: 'ENG-TIM-N52', price: '8500', catIdx: 5 },
      { name: 'Натяжитель ремня ГРМ', partNumber: 'ENG-TNS-UNI', price: '1800', catIdx: 5 },
      { name: 'Помпа охлаждения (Toyota)', partNumber: 'ENG-WPM-TOY', price: '2400', catIdx: 5 },
      // Кузов
      { name: 'Бампер передний Toyota Camry (грунт.)', partNumber: 'BDY-BMP-CAM-F', price: '12000', catIdx: 6 },
      { name: 'Крыло переднее левое BMW X5', partNumber: 'BDY-FND-BMW-FL', price: '18000', catIdx: 6 },
      // Шины
      { name: 'Шина лет. 205/55 R16 Michelin', partNumber: 'TYR-MSH-20555-16', price: '4800', catIdx: 7 },
      { name: 'Шина лет. 225/45 R17 Bridgestone', partNumber: 'TYR-BST-22545-17', price: '5600', catIdx: 7 },
      { name: 'Шина зим. 205/55 R16 Nokian', partNumber: 'TYR-NOK-20555-16', price: '5200', catIdx: 7 },
      { name: 'Диск литой R17 5x114.3', partNumber: 'WHL-ALY-R17', price: '7500', catIdx: 7 },
    ];
    const createdParts = await dbService.db.insert(spareParts).values(
      sparePartsData.map((p, i) => ({
        name: p.name,
        partNumber: p.partNumber,
        price: p.price,
        categoryId: createdPartCats[p.catIdx].id,
        supplierId: createdSuppliers[i % createdSuppliers.length].id,
        tenantId: tenant.id,
        minQuantity: rnd(5, 20),
      }))
    ).returning();

    // ── SparePartStore ─────────────────────────────────────────────────────────
    console.log('Seeding spare part stock...');
    const sparePartStoreData: typeof sparePartStore.$inferInsert[] = [];
    for (let i = 0; i < createdParts.length; i++) {
      const numStores = rnd(1, 3);
      const usedStores = new Set<string>();
      for (let j = 0; j < numStores; j++) {
        const store = createdStores[rnd(0, createdStores.length - 1)];
        if (!usedStores.has(store.id)) {
          usedStores.add(store.id);
          sparePartStoreData.push({
            sparePartId: createdParts[i].id,
            storeId: store.id,
            quantity: rnd(5, 100),
            tenantId: tenant.id,
          });
        }
      }
    }
    await dbService.db.insert(sparePartStore).values(sparePartStoreData);

    // ── PositionsForBuying + Invoices ─────────────────────────────────────────
    console.log('Seeding purchase orders and supplier invoices...');
    const purchaseStatuses = ['pending', 'delivered', 'in_transit'] as const;
    const pfbToInsert: typeof positionsForBuying.$inferInsert[] = [];

    for (const supplier of createdSuppliers) {
      const supplierParts = createdParts.filter(part => part.supplierId === supplier.id);
      const purchaseCount = rnd(3, 6);

      for (let j = 0; j < purchaseCount; j++) {
        const part = pick(supplierParts);
        pfbToInsert.push({
          supplierId: supplier.id,
          sparePartId: part.id,
          quantity: rnd(10, 150),
          deliveryDate: j % 2 === 0 ? pastDate(rnd(5, 120)) : futureDate(rnd(3, 45)),
          status: pick([...purchaseStatuses]),
          tenantId: tenant.id,
        });
      }
    }

    const createdPfb = await dbService.db.insert(positionsForBuying).values(pfbToInsert).returning();

    const invoicesToInsert: typeof invoices.$inferInsert[] = [];
    for (let i = 0; i < createdPfb.length; i++) {
      const position = createdPfb[i];
      const part = createdParts.find(item => item.id === position.sparePartId);
      const unitPrice = part ? parseFloat(part.price) : 1000;
      const totalAmount = unitPrice * position.quantity;

      invoicesToInsert.push({
        positionForBuyingId: position.id,
        amount: totalAmount.toFixed(2),
        invoiceDate: pastDate(rnd(1, 90)),
        status: pick(['paid', 'paid', 'pending', 'overdue']),
        tenantId: tenant.id,
      });

      if (i % 4 === 0) {
        invoicesToInsert.push({
          positionForBuyingId: position.id,
          amount: (totalAmount * 0.1).toFixed(2),
          invoiceDate: pastDate(rnd(1, 30)),
          status: pick(['paid', 'pending']),
          tenantId: tenant.id,
        });
      }
    }
    const createdInvoices = await dbService.db.insert(invoices).values(invoicesToInsert).returning();

    // ── Cars ──────────────────────────────────────────────────────────────────
    console.log('Seeding cars...');
    const carsToInsert: typeof cars.$inferInsert[] = [];
    for (let i = 0; i < customerUsers.length; i++) {
      const numCars = i % 5 === 0 ? 2 : 1;
      for (let j = 0; j < numCars; j++) {
        const brand = CAR_MODELS[(i + j) % CAR_MODELS.length];
        const model = brand.models[(i + j) % brand.models.length];
        const year = 2010 + ((i + j) % 14);
        carsToInsert.push({
          userId: customerUsers[i].id,
          brand: brand.brand,
          model,
          information: `${brand.brand} ${model} ${year}, бензин`,
          year,
          vin: `VIN${String(i * 2 + j).padStart(12, '0')}`,
          licensePlate: `${String.fromCharCode(65 + (i % 26))}${String(100 + i + j).slice(1)}${String.fromCharCode(65 + ((i + 3) % 26))}${String.fromCharCode(65 + ((i + 6) % 26))} 77`,
        });
      }
    }
    const createdCars = await dbService.db.insert(cars).values(carsToInsert).returning();

    const [predictDemoCar] = await dbService.db.insert(cars).values({
      userId: predictDemoUser.id,
      brand: 'Toyota',
      model: 'Camry',
      information: 'Toyota Camry 2018, 2.5 AT — демо-авто для предиктивного ТО',
      year: 2018,
      vin: 'JTDBR32E000999001',
      licensePlate: 'FT9 AB 7777',
    }).returning();

    // ── Branches ──────────────────────────────────────────────────────────────
    console.log('Seeding branches...');
    const branchesData = [
      { name: 'Центральный филиал', address: 'Минск, пр-т Независимости, 95', city: 'Минск', phone: '+375171234567', email: 'central.avtoservis@gmail.com', workingHours: 'Пн-Сб 9-21, Вс 10-18' },
      { name: 'Северный филиал', address: 'Минск, пр-т Победителей, 23', city: 'Минск', phone: '+375171234568', email: 'north.avtoservis@gmail.com', workingHours: 'Пн-Сб 9-20' },
      { name: 'Южный филиал', address: 'Минск, ул. Притыцкого, 65', city: 'Минск', phone: '+375171234569', email: 'south.avtoservis@gmail.com', workingHours: 'Пн-Сб 9-20' },
      { name: 'Гомельский филиал', address: 'Гомель, ул. Советская, 12', city: 'Гомель', phone: '+375232345670', email: 'gomel.avtoservis@gmail.com', workingHours: 'Пн-Пт 9-19' },
      { name: 'Брестский филиал', address: 'Брест, ул. Московская, 80', city: 'Брест', phone: '+375162345671', email: 'brest.avtoservis@gmail.com', workingHours: 'Пн-Пт 9-19' },
    ];
    const createdBranches = await dbService.db.insert(branches).values(
      branchesData.map((b, i) => ({
        ...b,
        managerId: managerUsers[i % managerUsers.length].id,
        isActive: true,
      }))
    ).returning();

    // Branch employees
    const branchEmpData: typeof branchEmployees.$inferInsert[] = [];
    for (let i = 0; i < createdEmployees.length; i++) {
      branchEmpData.push({
        branchId: createdBranches[i % createdBranches.length].id,
        employeeId: createdEmployees[i].id,
        isPrimary: i % 3 === 0,
      });
    }
    await dbService.db.insert(branchEmployees).values(branchEmpData);

    // Production posts per branch
    console.log('Seeding production posts...');
    const postsData: typeof productionPosts.$inferInsert[] = [];
    for (const branch of createdBranches) {
      for (let p = 1; p <= 3; p++) {
        postsData.push({
          branchId: branch.id,
          name: `Пост ${p}`,
          isActive: true,
        });
      }
    }
    const createdPosts = await dbService.db.insert(productionPosts).values(postsData).returning();

    // Assign managers to branches
    for (let i = 0; i < managerUsers.length; i++) {
      await dbService.db
        .update(users)
        .set({ branchId: createdBranches[i % createdBranches.length].id })
        .where(eq(users.id, managerUsers[i].id));
    }

    // ── Store Transfers ────────────────────────────────────────────────────────
    console.log('Seeding store transfers...');
    const transfersData: typeof storeTransfers.$inferInsert[] = [];
    for (let i = 0; i < 20; i++) {
      const fromIdx = i % createdStores.length;
      const toIdx = (i + 1) % createdStores.length;
      transfersData.push({
        fromStoreId: createdStores[fromIdx].id,
        toStoreId: createdStores[toIdx].id,
        sparePartId: createdParts[i % createdParts.length].id,
        quantity: rnd(5, 50),
        status: pick(['pending', 'in_transit', 'completed', 'completed', 'completed']),
        initiatedById: adminUser.id,
        notes: `Перемещение партии #${i + 1}`,
      });
    }
    await dbService.db.insert(storeTransfers).values(transfersData);

    // ── Time Slots ────────────────────────────────────────────────────────────
    console.log('Seeding time slots...');
    const timeSlotsData: typeof timeSlots.$inferInsert[] = [];
    for (let empIdx = 0; empIdx < Math.min(10, createdEmployees.length); empIdx++) {
      for (let day = -7; day <= 14; day++) {
        for (let slot = 0; slot < 4; slot++) {
          const slotDate = new Date();
          slotDate.setDate(slotDate.getDate() + day);
          slotDate.setHours(9 + slot * 2, 0, 0, 0);
          const slotEnd = new Date(slotDate);
          slotEnd.setHours(slotDate.getHours() + 2);
          timeSlotsData.push({
            employeeId: createdEmployees[empIdx].id,
            date: slotDate,
            startTime: slotDate,
            endTime: slotEnd,
            isBooked: day < 0 ? true : Math.random() > 0.6,
          });
        }
      }
    }
    const createdTimeSlots = await dbService.db.insert(timeSlots).values(timeSlotsData).returning();

    // ── Orders ────────────────────────────────────────────────────────────────
    console.log('Seeding orders (400)...');
    const statuses = ['pending', 'diagnosed', 'in_progress', 'quality_check', 'completed', 'completed', 'completed', 'cancelled'];
    const ordersToInsert: typeof orders.$inferInsert[] = [];
    for (let i = 0; i < 400; i++) {
      const custIdx = i % customerUsers.length;
      const custCars = createdCars.filter(c => c.userId === customerUsers[custIdx].id);
      ordersToInsert.push({
        userId: customerUsers[custIdx].id,
        carId: custCars[i % custCars.length].id,
        employeeId: createdEmployees[i % createdEmployees.length].id,
        branchId: createdBranches[i % createdBranches.length].id,
        postId: createdPosts[i % createdPosts.length].id,
        status: pickIdx(statuses, i),
        createdAt: pastDate(rnd(0, 365)),
        completedAt: i % 3 !== 2 ? pastDate(rnd(0, 30)) : undefined,
      });
    }
    const createdOrders = await dbService.db.insert(orders).values(ordersToInsert).returning();

    // Services for orders
    const servicesOrdersData: typeof servicesOrders.$inferInsert[] = [];
    for (let i = 0; i < createdOrders.length; i++) {
      const count = rnd(1, 4);
      const usedSvc = new Set<string>();
      for (let j = 0; j < count; j++) {
        const svc = createdServices[(i * 3 + j) % createdServices.length];
        if (!usedSvc.has(svc.id)) {
          usedSvc.add(svc.id);
          servicesOrdersData.push({ orderId: createdOrders[i].id, servicesId: svc.id, quantity: 1 });
        }
      }
    }
    await dbService.db.insert(servicesOrders).values(servicesOrdersData);

    // Spare parts for orders
    const sparePartOrdersData: typeof sparePartOrders.$inferInsert[] = [];
    for (let i = 0; i < createdOrders.length; i++) {
      if (i % 2 === 0) {
        const count = rnd(1, 3);
        const usedParts = new Set<string>();
        for (let j = 0; j < count; j++) {
          const part = createdParts[(i * 2 + j) % createdParts.length];
          if (!usedParts.has(part.id)) {
            usedParts.add(part.id);
            sparePartOrdersData.push({ ordersId: createdOrders[i].id, sparePartId: part.id, quantity: rnd(1, 4) });
          }
        }
      }
    }
    await dbService.db.insert(sparePartOrders).values(sparePartOrdersData);

    // Payments
    const paymentsData: typeof payments.$inferInsert[] = [];
    for (let i = 0; i < createdOrders.length; i++) {
      const ord = createdOrders[i];
      if (ord.status === 'completed' || (ord.status === 'pending' && i % 4 === 0)) {
        const svcTotal = servicesOrdersData
          .filter(so => so.orderId === ord.id)
          .reduce((sum, so) => {
            const svc = createdServices.find(s => s.id === so.servicesId);
            return sum + (svc ? Number(svc.price) : 0);
          }, 0);
        const partsTotal = sparePartOrdersData
          .filter(spo => spo.ordersId === ord.id)
          .reduce((sum, spo) => {
            const part = createdParts.find(p => p.id === spo.sparePartId);
            return sum + (part ? parseFloat(part.price) * (spo.quantity ?? 1) : 0);
          }, 0);
        paymentsData.push({
          orderId: ord.id,
          amount: (svcTotal + partsTotal || rnd(500, 15000)).toString(),
          status: ord.status === 'completed' ? 'paid' : pick(['pending', 'paid']),
          paymentMethod: pick(['cash', 'card', 'online', 'card', 'online']),
          paymentDate: ord.createdAt ? new Date(ord.createdAt.getTime() + rnd(1, 5) * 86400000) : new Date(),
        });
      }
    }
    await dbService.db.insert(payments).values(paymentsData);

    // ── Gantt / schedule optimization demo ───────────────────────────────────
    console.log('Seeding Gantt demo orders (today + 2 days)...');
    const ganttDemoOrdersData: typeof orders.$inferInsert[] = [];
    const ganttServiceLinks: { servicesId: string; durationMin: number }[] = [];
    const masterCount = Math.min(10, createdEmployees.length);
    const ganttStatuses = ['pending', 'diagnosed', 'in_progress', 'in_progress', 'quality_check'] as const;
    const ganttServicePool = createdServices.filter(s => Number(s.durationMinutes) <= 90);
    const ganttServices = ganttServicePool.length > 0 ? ganttServicePool : createdServices.slice(0, 12);
    const masterNextSlot = new Map<string, Date>();
    const GANTT_BUFFER_MIN = 10;
    const DAY_END_HOUR = 19;

    for (const dayOffset of [0, 1, 2]) {
      // Assigned — 2 orders per master, sequential (visible gaps for optimize demo)
      for (let i = 0; i < masterCount * 2; i++) {
        const cust = customerUsers[i % customerUsers.length];
        const custCars = createdCars.filter(c => c.userId === cust.id);
        if (custCars.length === 0) continue;

        const emp = createdEmployees[i % masterCount];
        const slotKey = `${dayOffset}:${emp.id}`;
        const svc = ganttServices[i % ganttServices.length];
        const durMin = Number(svc.durationMinutes) || 60;

        const nextStart = masterNextSlot.get(slotKey) ?? scheduleDayAt(dayOffset, 8, 0);
        const dayEndLimit = scheduleDayAt(dayOffset, DAY_END_HOUR, 0);
        if (nextStart >= dayEndLimit) continue;

        const slotEnd = new Date(nextStart.getTime() + durMin * 60 * 1000);
        if (slotEnd > dayEndLimit) continue;

        ganttDemoOrdersData.push({
          userId: cust.id,
          carId: custCars[i % custCars.length].id,
          employeeId: emp.id,
          branchId: createdBranches[i % createdBranches.length].id,
          postId: createdPosts[i % createdPosts.length].id,
          status: pickIdx([...ganttStatuses], i + dayOffset),
          scheduledStartAt: nextStart,
          createdAt: nextStart,
          updatedAt: nextStart,
        });
        ganttServiceLinks.push({ servicesId: svc.id, durationMin: durMin });

        masterNextSlot.set(
          slotKey,
          new Date(nextStart.getTime() + (durMin + GANTT_BUFFER_MIN) * 60 * 1000),
        );
      }

      // Unassigned pending — same service all masters can do
      for (let i = 0; i < 15; i++) {
        const cust = customerUsers[(i + 40 + dayOffset * 7) % customerUsers.length];
        const custCars = createdCars.filter(c => c.userId === cust.id);
        if (custCars.length === 0) continue;

        ganttDemoOrdersData.push({
          userId: cust.id,
          carId: custCars[0].id,
          branchId: createdBranches[i % createdBranches.length].id,
          status: 'pending',
          scheduledStartAt: scheduleDayAt(dayOffset, 9 + (i % 8), (i % 2) * 30),
          createdAt: new Date(),
        });
        ganttServiceLinks.push({
          servicesId: optimizeDemoService.id,
          durationMin: Number(optimizeDemoService.durationMinutes) || 60,
        });
      }
    }

    const ganttOrders = await dbService.db.insert(orders).values(ganttDemoOrdersData).returning();
    await dbService.db.insert(servicesOrders).values(
      ganttOrders.map((ord, i) => ({
        orderId: ord.id,
        servicesId: ganttServiceLinks[i]?.servicesId ?? ganttServices[i % ganttServices.length].id,
        quantity: 1,
      })),
    );

    // ── Appointments ──────────────────────────────────────────────────────────
    console.log('Seeding appointments...');
    type ApptStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
    const apptStatuses: ApptStatus[] = ['completed', 'completed', 'confirmed', 'pending', 'cancelled', 'no_show'];
    const apptsData: typeof appointments.$inferInsert[] = [];
    for (let i = 0; i < 150; i++) {
      const custIdx = i % customerUsers.length;
      const custCars = createdCars.filter(c => c.userId === customerUsers[custIdx].id);
      const slot = createdTimeSlots[i % createdTimeSlots.length];
      apptsData.push({
        userId: customerUsers[custIdx].id,
        carId: custCars[i % custCars.length].id,
        serviceId: createdServices[i % createdServices.length].id,
        employeeId: createdEmployees[i % createdEmployees.length].id,
        timeSlotId: slot.id,
        status: pickIdx(apptStatuses, i),
        scheduledAt: slot.startTime,
        notes: i % 5 === 0 ? 'Просьба позвонить за 30 минут' : undefined,
        confirmationCode: `APPT${String(1000 + i)}`,
      });
    }
    // Demo: appointment in ~24h for user1 (cron reminder test)
    const user1 = customerUsers[0];
    const user1Cars = createdCars.filter(c => c.userId === user1.id);
    if (user1Cars.length > 0) {
      const reminderDate = new Date();
      reminderDate.setHours(reminderDate.getHours() + 24);
      apptsData.push({
        userId: user1.id,
        carId: user1Cars[0].id,
        serviceId: createdServices[0].id,
        employeeId: createdEmployees[0].id,
        status: 'confirmed',
        scheduledAt: reminderDate,
        confirmationCode: 'DEMO24H',
        notes: 'Демо-запись для теста напоминания за 24ч',
      });
    }
    await dbService.db.insert(appointments).values(apptsData);

    // ── Subscriptions ─────────────────────────────────────────────────────────
    console.log('Seeding subscriptions...');
    const subsData: typeof subscriptions.$inferInsert[] = [];
    for (let i = 0; i < 20; i++) {
      const employee = createdEmployees[i % createdEmployees.length];
      const customer = customerUsers[i % customerUsers.length];
      const dateStart = new Date();
      const dateEnd = new Date();
      dateEnd.setMonth(dateEnd.getMonth() + 6);
      subsData.push({
        userId: customer.id,
        employeeId: employee.id,
        subscriptionName: 'Подписка на рабочего',
        subscriptionDescription: `Подписка на рабочего ${employee.name} ${employee.surName}`,
        dateStart,
        dateEnd,
      });
    }
    await dbService.db.insert(subscriptions).values(subsData);

    // ── Reviews ───────────────────────────────────────────────────────────────
    console.log('Seeding reviews...');
    const reviewTexts = [
      'Отличный сервис! Всё быстро и качественно.',
      'Мастера профессионалы, буду обращаться ещё.',
      'Приятно удивлён качеством работы.',
      'Хороший сервис, но немного долго ждал.',
      'Рекомендую! Всё сделали в срок.',
      'Нашли проблему, которую другие пропускали.',
      'Вежливый персонал, чисто в цеху.',
      'Цены приемлемые, качество отличное.',
    ];
    const reviewsData: typeof reviews.$inferInsert[] = [];
    for (let i = 0; i < 120; i++) {
      reviewsData.push({
        userId: customerUsers[i % customerUsers.length].id,
        employeeId: createdEmployees[i % createdEmployees.length].id,
        description: pickIdx(reviewTexts, i),
        rate: rnd(3, 5),
        createdAt: pastDate(rnd(0, 300)),
        deletedAt: i % 15 === 0 ? pastDate(rnd(0, 30)) : undefined,
      });
    }
    await dbService.db.insert(reviews).values(reviewsData);

    // ── Discounts ─────────────────────────────────────────────────────────────
    console.log('Seeding discounts...');
    const discountsData: typeof discounts.$inferInsert[] = [
      { code: 'WELCOME10', name: 'Скидка новичка', type: 'percent', value: '10', isActive: true, startDate: pastDate(180), endDate: futureDate(180), maxUsageCount: 500 },
      { code: 'SUMMER20', name: 'Летняя акция', type: 'percent', value: '20', isActive: true, startDate: pastDate(30), endDate: futureDate(60) },
      { code: 'FIXED500', name: 'Скидка 500 BYN', type: 'fixed', value: '500', isActive: true, minOrderAmount: '3000' },
      { code: 'VIP15', name: 'VIP скидка', type: 'percent', value: '15', isActive: true },
      { code: 'WINTER25', name: 'Зимняя акция 25%', type: 'percent', value: '25', isActive: false, startDate: pastDate(120), endDate: pastDate(30) },
      { code: 'BDAY', name: 'День рождения', type: 'percent', value: '12', isActive: true },
      { code: 'USER1VIP', name: 'Персональная скидка user1', type: 'percent', value: '8', isActive: true, userId: customerUsers[0].id },
    ];
    const createdDiscounts = await dbService.db.insert(discounts).values(discountsData).returning();

    // Order discounts for some completed orders
    const completedOrders = createdOrders.filter(o => o.status === 'completed').slice(0, 40);
    if (completedOrders.length > 0) {
      await dbService.db.insert(orderDiscounts).values(
        completedOrders.map((o, i) => ({
          orderId: o.id,
          discountId: createdDiscounts[i % createdDiscounts.length].id,
          appliedAmount: (rnd(200, 2000)).toString(),
        }))
      );
    }

    // ── Loyalty Programs ──────────────────────────────────────────────────────
    console.log('Seeding loyalty programs...');
    const loyaltyData: typeof loyaltyPrograms.$inferInsert[] = customerUsers.slice(0, 100).map((u, i) => ({
      userId: u.id,
      points: i === 0 ? 2500 : rnd(0, 5000),
      tier: i === 0 ? 'gold' as const : (['bronze', 'bronze', 'bronze', 'silver', 'silver', 'gold', 'platinum'] as const)[i % 7],
      totalEarned: i === 0 ? 8000 : rnd(500, 20000),
      totalSpent: rnd(0, 5000),
    }));
    const createdLoyalty = await dbService.db.insert(loyaltyPrograms).values(loyaltyData).returning();

    const loyaltyTxData: typeof loyaltyTransactions.$inferInsert[] = [];
    for (let i = 0; i < createdLoyalty.length; i++) {
      const numTx = rnd(2, 8);
      for (let j = 0; j < numTx; j++) {
        loyaltyTxData.push({
          programId: createdLoyalty[i].id,
          orderId: j < createdOrders.length ? createdOrders[(i * 3 + j) % createdOrders.length].id : undefined,
          type: pick(['earn', 'earn', 'earn', 'spend', 'bonus']),
          points: rnd(50, 500),
          description: pick(['Начисление за заказ', 'Списание на скидку', 'Бонус дня рождения', 'Акционные баллы']),
          createdAt: pastDate(rnd(1, 365)),
        });
      }
    }
    await dbService.db.insert(loyaltyTransactions).values(loyaltyTxData);

    // ── Warranties ────────────────────────────────────────────────────────────
    console.log('Seeding warranties...');
    const completedOrdersAll = createdOrders.filter(o => o.status === 'completed');
    const warrantiesData: typeof warranties.$inferInsert[] = completedOrdersAll.slice(0, 80).map((o, i) => {
      const issuedAt = o.completedAt ?? pastDate(rnd(30, 200));
      const expires = new Date(issuedAt);
      expires.setMonth(expires.getMonth() + (3 * (1 + (i % 4))));
      return {
        orderId: o.id,
        sparePartId: i % 2 === 0 ? createdParts[i % createdParts.length].id : undefined,
        type: pick(['work', 'spare_part', 'complex']),
        status: (expires > new Date() ? 'active' : pick(['expired', 'claimed'])),
        description: `Гарантия на выполненные работы по заказу`,
        durationMonths: 3 * (1 + (i % 4)),
        issuedAt,
        expiresAt: expires,
      };
    });
    const createdWarranties = await dbService.db.insert(warranties).values(warrantiesData).returning();

    // Warranty claims for some warranties
    const claimableWarranties = createdWarranties.filter(w => w.status === 'claimed' || w.status === 'active').slice(0, 15);
    if (claimableWarranties.length > 0) {
      await dbService.db.insert(warrantyClaims).values(
        claimableWarranties.map((w, i) => ({
          warrantyId: w.id,
          userId: customerUsers[i % customerUsers.length].id,
          description: pick(['Повторилась та же неисправность', 'Запчасть вышла из строя', 'Появился шум после ремонта']),
          status: pick(['open', 'under_review', 'approved', 'resolved'] as const),
          resolution: i % 2 === 0 ? 'Принято в работу, запланирован повторный ремонт' : null,
          createdAt: pastDate(rnd(1, 60)),
        }))
      );
    }

    // ── Companies (Corporate clients) ─────────────────────────────────────────
    console.log('Seeding companies...');
    const companiesData: typeof companies.$inferInsert[] = [
      { name: 'ООО "БелЛогистик"', inn: 'BY193456781', address: 'Минск, ул. Промышленная, 1', city: 'Минск', contactPerson: 'Карпов А.В.', phone: '+375291234001', email: 'fleet.bellogistic@gmail.com', managerUserId: managerUsers[0].id, bankAccount: 'BY12ALFA30140000000000000000', bic: 'ALFABY2X' },
      { name: 'ОАО "МинскТранс"', inn: 'BY192356789', address: 'Минск, пр-т Партизанский, 87', city: 'Минск', contactPerson: 'Глинский Б.И.', phone: '+375291234002', email: 'auto.minsktrans@gmail.com', managerUserId: managerUsers[1].id, bankAccount: 'BY22UNBS30140000000000000000', bic: 'UNBSBY2X' },
      { name: 'ИП Ходасевич В.С.', inn: 'BY190034561', address: 'Гомель, ул. Ленина, 5', city: 'Гомель', contactPerson: 'Ходасевич В.С.', phone: '+375291234003', email: 'hadas.hodasevich@gmail.com', managerUserId: managerUsers[0].id, bankAccount: 'BY33MTBK30140000000000000000', bic: 'MTBKBANK' },
      { name: 'ООО "ТрансАвто"', inn: 'BY191234567', address: 'Брест, ул. Московская, 112', city: 'Брест', contactPerson: 'Симонов В.Г.', phone: '+375291234004', email: 'transavto.corp@gmail.com', managerUserId: managerUsers[2].id, bankAccount: 'BY44BPSB30140000000000000000', bic: 'BPSBBY2X' },
      { name: 'ЗАО "АвтоПарк Плюс"', inn: 'BY193456780', address: 'Минск, ул. Притыцкого, 55', city: 'Минск', contactPerson: 'Купреевич К.Д.', phone: '+375291234005', email: 'avtopark.corp@gmail.com', managerUserId: managerUsers[3].id, bankAccount: 'BY55PRIORB30140000000000000000', bic: 'POISBY2X' },
    ];
    const createdCompanies = await dbService.db.insert(companies).values(companiesData).returning();

    await dbService.db.insert(companyContracts).values(
      createdCompanies.map((c, i) => ({
        companyId: c.id,
        contractNumber: `ДАГ-2024-${String(100 + i).padStart(3, '0')}`,
        status: pick(['active', 'active', 'active', 'suspended', 'draft']) as 'active' | 'suspended' | 'expired' | 'draft' | 'terminated',
        discountPercent: pick(['5.00', '7.50', '10.00', '12.00', '15.00']),
        creditLimit: pick(['50000.00', '100000.00', '200000.00', '500000.00']),
        paymentTermDays: pick(['14', '30', '45']),
        startDate: pastDate(rnd(30, 365)),
        endDate: futureDate(rnd(30, 365)),
        notes: `Корпоративный договор на обслуживание парка`,
      }))
    );

    // Assign some cars to companies
    const companyCarsData: typeof companyCars.$inferInsert[] = [];
    for (let i = 0; i < createdCompanies.length; i++) {
      const count = rnd(3, 8);
      for (let j = 0; j < count; j++) {
        const carIdx = (i * 5 + j) % createdCars.length;
        companyCarsData.push({
          companyId: createdCompanies[i].id,
          carId: createdCars[carIdx].id,
          notes: `Автомобиль парка компании`,
        });
      }
    }
    // Remove duplicate (companyId, carId) pairs
    const uniqueCompanyCars = Array.from(
      new Map(companyCarsData.map(cc => [`${cc.companyId}:${cc.carId}`, cc])).values()
    );
    await dbService.db.insert(companyCars).values(uniqueCompanyCars);

    // Company drivers (user1 as driver for БелЛогистик)
    await dbService.db.insert(companyDrivers).values([
      { companyId: createdCompanies[0].id, userId: customerUsers[0].id },
      { companyId: createdCompanies[0].id, userId: customerUsers[1].id },
      { companyId: createdCompanies[1].id, userId: customerUsers[2].id },
    ]);

    // ── FT-9 Predictive maintenance demo data ─────────────────────────────────
    console.log('Seeding predictive maintenance demo data...');
    const predictNextOilMileage = PREDICT_DEMO_MILEAGE.lastOilService + 10000;
    const predictNextTireMileage = PREDICT_DEMO_MILEAGE.lastTireRotation + 15000;
    const predictNextBrakeMileage = PREDICT_DEMO_MILEAGE.lastBrakeService + 30000;
    const predictScheduledDueDate = futureDate(28);

    await dbService.db.insert(maintenanceReminders).values([
      {
        userId: predictDemoUser.id,
        carId: predictDemoCar.id,
        type: 'oil_change',
        description: 'Замена масла: выполнено ранее',
        dueMileage: PREDICT_DEMO_MILEAGE.lastOilService,
        isCompleted: true,
        isSent: true,
        createdAt: pastDate(330),
      },
      {
        userId: predictDemoUser.id,
        carId: predictDemoCar.id,
        type: 'tire_rotation',
        description: 'Ротация шин: выполнено ранее',
        dueMileage: PREDICT_DEMO_MILEAGE.lastTireRotation,
        isCompleted: true,
        isSent: true,
        createdAt: pastDate(150),
      },
      {
        userId: predictDemoUser.id,
        carId: predictDemoCar.id,
        type: 'brake_service',
        description: 'Обслуживание тормозов: выполнено ранее',
        dueMileage: PREDICT_DEMO_MILEAGE.lastBrakeService,
        isCompleted: true,
        isSent: true,
        createdAt: pastDate(400),
      },
      {
        userId: predictDemoUser.id,
        carId: predictDemoCar.id,
        type: 'scheduled_maintenance',
        description: 'Плановое ТО: выполнено ранее',
        dueMileage: PREDICT_DEMO_MILEAGE.lastScheduledMaintenance,
        isCompleted: true,
        isSent: true,
        createdAt: pastDate(335),
      },
    ]);

    await dbService.db.insert(diagnosticSessions).values([
      {
        carId: predictDemoCar.id,
        employeeId: createdEmployees[0].id,
        mileage: 75200,
        notes: 'Диагностика: без ошибок, фиксация пробега для расчёта среднего',
        createdAt: pastDate(120),
      },
      {
        carId: predictDemoCar.id,
        employeeId: createdEmployees[1].id,
        mileage: 78800,
        notes: 'Контрольный осмотр перед дальней поездкой',
        createdAt: pastDate(55),
      },
      {
        carId: predictDemoCar.id,
        employeeId: createdEmployees[0].id,
        mileage: PREDICT_DEMO_MILEAGE.current,
        notes: 'Текущий пробег — до замены масла осталось менее 10% интервала',
        createdAt: pastDate(7),
      },
    ]);

    await dbService.db.insert(maintenanceReminders).values([
      {
        userId: predictDemoUser.id,
        carId: predictDemoCar.id,
        type: 'oil_change',
        description: `Замена масла: осталось ~${predictNextOilMileage - PREDICT_DEMO_MILEAGE.current} км`,
        dueMileage: predictNextOilMileage,
      },
      {
        userId: predictDemoUser.id,
        carId: predictDemoCar.id,
        type: 'tire_rotation',
        description: `Ротация шин: осталось ~${predictNextTireMileage - PREDICT_DEMO_MILEAGE.current} км`,
        dueMileage: predictNextTireMileage,
      },
      {
        userId: predictDemoUser.id,
        carId: predictDemoCar.id,
        type: 'brake_service',
        description: `Обслуживание тормозов: осталось ~${predictNextBrakeMileage - PREDICT_DEMO_MILEAGE.current} км`,
        dueMileage: predictNextBrakeMileage,
      },
      {
        userId: predictDemoUser.id,
        carId: predictDemoCar.id,
        type: 'scheduled_maintenance',
        description: 'Плановое ТО: осталось ~28 дней',
        dueDate: predictScheduledDueDate,
      },
    ]);

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n✅ Seed completed!');
    console.log(`  Users:           ${createdUsers.length + 1} (1 admin, 4 managers, ${customerUsers.length + 1} customers)`);
    console.log(`  Employees:       ${createdEmployees.length}`);
    console.log(`  Work types:      ${createdWorkTypes.length}`);
    console.log(`  Qualifications:  ${qualificationsToInsert.length}`);
    console.log(`  Master subs:     ${subsData.length}`);
    console.log(`  Services:        ${createdServices.length}`);
    console.log(`  Spare parts:     ${createdParts.length}`);
    console.log(`  Stores:          ${createdStores.length}`);
    console.log(`  Suppliers:       ${createdSuppliers.length}`);
    console.log(`  Purchase orders: ${createdPfb.length}`);
    console.log(`  Supplier bills:  ${createdInvoices.length}`);
    console.log(`  Cars:            ${createdCars.length}`);
    console.log(`  Branches:        ${createdBranches.length}`);
    console.log(`  Prod. posts:     ${createdPosts.length}`);
    console.log(`  Orders:          ${createdOrders.length + ganttOrders.length}`);
    console.log(`  Gantt demo:      ${ganttOrders.length} (today/tomorrow/day+2)`);
    console.log(`  Payments:        ${paymentsData.length}`);
    console.log(`  Appointments:    ${apptsData.length}`);
    console.log(`  Warranties:      ${warrantiesData.length}`);
    console.log(`  Loyalty users:   ${createdLoyalty.length}`);
    console.log(`  Companies:       ${createdCompanies.length}`);
    console.log('\n  Login: admin@gmail.com / password123');
    console.log('  Login: user1@gmail.com / password123');
    console.log('  Predictive demo: predict.demo@gmail.com / password123');
    console.log('    → Toyota Camry FT9 AB 7777, пробег ~82600 км');
    console.log('    → 4 рекомендации ТО в профиле и /diagnostics');
    console.log('  Blocked:         user3@gmail.com, user8@gmail.com');

  } catch (error: unknown) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await dbService.close();
  }
}

void seed();
