import { DatabaseService } from '../modules/database/database.service';
import {
  users,
  roles,
  employees,
  positions,
  services,
  suppliers,
  categories,
  spareParts,
  stores,
  sparePartStore,
  cars,
  orders,
  servicesOrders,
  sparePartOrders,
  payments,
} from '../drizzle/schema';
import * as bcrypt from 'bcrypt';

async function seed() {
  const dbService = new DatabaseService();

  try {
    // Clear tables (order respects FK)
    await dbService.db.delete(sparePartStore);
    await dbService.db.delete(servicesOrders);
    await dbService.db.delete(sparePartOrders);
    await dbService.db.delete(payments);
    await dbService.db.delete(orders);
    await dbService.db.delete(cars);
    await dbService.db.delete(spareParts);
    await dbService.db.delete(categories);
    await dbService.db.delete(stores);
    await dbService.db.delete(services);
    await dbService.db.delete(employees);
    await dbService.db.delete(positions);
    await dbService.db.delete(users);
    await dbService.db.delete(suppliers);
    await dbService.db.delete(roles);

    // Create roles
    await dbService.db.insert(roles).values({ name: 'guest' });
    const [adminRole] = await dbService.db
      .insert(roles)
      .values({ name: 'admin' })
      .returning();
    const [managerRole] = await dbService.db
      .insert(roles)
      .values({ name: 'manager' })
      .returning();
    const [customerRole] = await dbService.db
      .insert(roles)
      .values({ name: 'customer' })
      .returning();

    // Create users
    const passwordHash: string = await bcrypt.hash('password123', 10);
    const usersData = [
      {
        login: 'alice',
        name: 'Alice',
        surName: 'Johnson',
        email: 'alice@example.com',
        phone: '+1-202-555-0101',
        passwordHash,
        roleId: adminRole.id,
      },
      {
        login: 'bob',
        name: 'Bob',
        surName: 'Williams',
        email: 'bob@example.com',
        phone: '+1-202-555-0102',
        passwordHash,
        roleId: managerRole.id,
      },
      {
        login: 'carol',
        name: 'Carol',
        surName: 'Smith',
        email: 'carol@example.com',
        phone: '+1-202-555-0103',
        passwordHash,
        roleId: customerRole.id,
      },
      {
        login: 'dave',
        name: 'Dave',
        surName: 'Brown',
        email: 'dave@example.com',
        phone: '+1-202-555-0104',
        passwordHash,
        roleId: customerRole.id,
      },
      {
        login: 'eva',
        name: 'Eva',
        surName: 'Miller',
        email: 'eva@example.com',
        phone: '+1-202-555-0105',
        passwordHash,
        roleId: customerRole.id,
      },
      {
        login: 'frank',
        name: 'Frank',
        surName: 'Taylor',
        email: 'frank@example.com',
        phone: '+1-202-555-0106',
        passwordHash,
        roleId: customerRole.id,
      },
    ];
    const createdUsers = await dbService.db
      .insert(users)
      .values(usersData)
      .returning();

    // Create positions
    const positionsData = [
      { name: 'Mechanic', description: 'Auto mechanic' },
      { name: 'Manager', description: 'Service manager' },
      { name: 'Receptionist', description: 'Front desk receptionist' },
      { name: 'Technician', description: 'Auto technician' },
    ];
    const createdPositions = await dbService.db
      .insert(positions)
      .values(positionsData)
      .returning();

    // Create employees (10+)
    const employeesData = [
      {
        positionId: createdPositions[0].id,
        hireDate: new Date(2020, 0, 1),
        salary: '45000',
        name: 'Антон',
        surName: 'Громов',
        lastName: 'Игоревич',
      },
      {
        positionId: createdPositions[0].id,
        hireDate: new Date(2021, 2, 10),
        salary: '48000',
        name: 'Мария',
        surName: 'Сидорова',
        lastName: 'Андреевна',
      },
      {
        positionId: createdPositions[1].id,
        hireDate: new Date(2019, 5, 5),
        salary: '60000',
        name: 'Дмитрий',
        surName: 'Семенов',
        lastName: 'Петрович',
      },
      {
        positionId: createdPositions[2].id,
        hireDate: new Date(2022, 3, 15),
        salary: '35000',
        name: 'Юлия',
        surName: 'Орлова',
      },
      {
        positionId: createdPositions[3].id,
        hireDate: new Date(2023, 1, 20),
        salary: '52000',
        name: 'Владислав',
        surName: 'Козлов',
      },
    ];
    const createdEmployees = await dbService.db
      .insert(employees)
      .values(employeesData)
      .returning();

    // Create services (10+)
    const servicesData = [
      {
        name: 'Замена масла',
        description: 'Полная замена масла и фильтра',
        price: 120,
      },
      {
        name: 'Диагностика',
        description: 'Комплексная диагностика',
        price: 80,
      },
      {
        name: 'Замена тормозных колодок',
        description: 'Передняя ось',
        price: 150,
      },
      { name: 'Замена свечей', description: 'Свечи зажигания', price: 90 },
      { name: 'Ремонт подвески', description: 'Шаровые, стойки', price: 200 },
      {
        name: 'Ремонт электрики',
        description: 'Электрооборудование',
        price: 180,
      },
    ];
    const createdServices = await dbService.db
      .insert(services)
      .values(servicesData)
      .returning();

    // Create suppliers (10+)
    const suppliersData = [
      {
        name: 'AutoParts Ltd',
        contact: 'sales@autoparts.com',
        address: 'Минск, ул. Ленина 10',
      },
      {
        name: 'Brake&Co',
        contact: 'info@brakeco.com',
        address: 'Минск, пр-т Победителей 25',
      },
      {
        name: 'EngineMaster',
        contact: 'hello@engine-master.com',
        address: 'Гомель, ул. Кирова 5',
      },
    ];
    const createdSuppliers = await dbService.db
      .insert(suppliers)
      .values(suppliersData)
      .returning();

    // Create categories
    const categoriesData = [
      { name: 'Двигатель', description: 'Детали двигателя' },
      { name: 'Тормоза', description: 'Тормозные системы' },
      { name: 'Подвеска', description: 'Подвеска и рулевое' },
      { name: 'Электрика', description: 'Электрооборудование' },
    ];
    const createdCategories = await dbService.db
      .insert(categories)
      .values(categoriesData)
      .returning();

    // Create spare parts (10+)
    const sparePartsData = [
      {
        name: 'Фильтр масляный',
        partNumber: 'OF-1001',
        price: '25.50',
        categoryId: createdCategories[0].id,
      },
      {
        name: 'Свеча зажигания',
        partNumber: 'SP-2002',
        price: '12.90',
        categoryId: createdCategories[0].id,
      },
      {
        name: 'Колодки тормозные',
        partNumber: 'BR-3003',
        price: '45.00',
        categoryId: createdCategories[1].id,
      },
      {
        name: 'Амортизатор передний',
        partNumber: 'SU-4004',
        price: '110.00',
        categoryId: createdCategories[2].id,
      },
      {
        name: 'Рулевой наконечник',
        partNumber: 'ST-5005',
        price: '38.70',
        categoryId: createdCategories[2].id,
      },
      {
        name: 'Аккумулятор 60Ah',
        partNumber: 'EL-6006',
        price: '95.00',
        categoryId: createdCategories[3].id,
      },
    ];
    const createdSpareParts = await dbService.db
      .insert(spareParts)
      .values(sparePartsData)
      .returning();

    // Create stores
    const storesData = [
      { location: 'Склад Центральный' },
      { location: 'Склад Северный' },
      { location: 'Магазин на пр-т Победителей' },
    ];
    const createdStores = await dbService.db
      .insert(stores)
      .values(storesData)
      .returning();

    // Create spare part store relationships
    const sparePartStoreData = createdSpareParts.map((part, idx) => ({
      sparePartId: part.id,
      storeId: createdStores[idx % createdStores.length].id,
      quantity: 10 + idx * 2,
    }));
    await dbService.db.insert(sparePartStore).values(sparePartStoreData);

    // Create cars for users
    const carsData: Array<{
      userId: number;
      name: string;
      information: string;
      year: number;
      vin: string;
      licensePlate: string;
    }> = [];
    for (let i = 0; i < createdUsers.length; i++) {
      carsData.push({
        userId: createdUsers[i].id,
        name: `Car Model ${i + 1}`,
        information: `Car information ${i + 1}`,
        year: 2020 + (i % 5),
        vin: `VIN${i.toString().padStart(10, '0')}`,
        licensePlate: `ABC-${i.toString().padStart(3, '0')}`,
      });
    }
    await dbService.db.insert(cars).values(carsData);

    console.log('Database seeded successfully!');
    console.log(
      `Created: ${createdUsers.length} users, ${createdEmployees.length} employees, ${createdServices.length} services, ${createdSuppliers.length} suppliers, ${createdSpareParts.length} spare parts`
    );
  } catch (error: unknown) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await dbService.close();
  }
}

void seed();
