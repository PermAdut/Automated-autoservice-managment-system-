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
  workSchedules,
  subscriptions,
  reviews,
  positionsForBuying,
  invoices,
  passports,
} from '../drizzle/schema';
import * as bcrypt from 'bcrypt';

async function seed() {
  const dbService = new DatabaseService();

  try {
    // Clear tables (order respects FK)
    await dbService.db.delete(invoices);
    await dbService.db.delete(positionsForBuying);
    await dbService.db.delete(reviews);
    await dbService.db.delete(subscriptions);
    await dbService.db.delete(workSchedules);
    await dbService.db.delete(sparePartStore);
    await dbService.db.delete(servicesOrders);
    await dbService.db.delete(sparePartOrders);
    await dbService.db.delete(payments);
    await dbService.db.delete(orders);
    await dbService.db.delete(cars);
    await dbService.db.delete(passports);
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
    const createdCars = await dbService.db
      .insert(cars)
      .values(carsData)
      .returning();

    // Create orders (10+)
    const ordersData: Array<{
      userId: number;
      carId: number;
      employeeId: number;
      status: string;
      createdAt: Date;
    }> = [];
    for (let i = 0; i < 12; i++) {
      const userId = createdUsers[i % createdUsers.length].id;
      const carId = createdCars[i % createdCars.length].id;
      const employeeId = createdEmployees[i % createdEmployees.length].id;
      const statuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      ordersData.push({
        userId,
        carId,
        employeeId,
        status: statuses[i % statuses.length],
        createdAt: new Date(2024, 0, 1 + i * 3),
      });
    }
    const createdOrders = await dbService.db
      .insert(orders)
      .values(ordersData)
      .returning();

    // Create services_orders relationships
    const servicesOrdersData: Array<{
      orderId: number;
      servicesId: number;
      quantity: number;
    }> = [];
    for (let i = 0; i < createdOrders.length; i++) {
      const order = createdOrders[i];
      // Каждый заказ имеет 1-3 услуги
      const numServices = 1 + (i % 3);
      for (let j = 0; j < numServices; j++) {
        servicesOrdersData.push({
          orderId: order.id,
          servicesId: createdServices[j % createdServices.length].id,
          quantity: 1 + (j % 2),
        });
      }
    }
    await dbService.db.insert(servicesOrders).values(servicesOrdersData);

    // Create spare_part_orders relationships
    const sparePartOrdersData: Array<{
      ordersId: number;
      sparePartId: number;
      quantity: number;
    }> = [];
    for (let i = 0; i < createdOrders.length; i++) {
      const order = createdOrders[i];
      // Каждый второй заказ имеет запчасти
      if (i % 2 === 0) {
        const numParts = 1 + (i % 2);
        for (let j = 0; j < numParts; j++) {
          sparePartOrdersData.push({
            ordersId: order.id,
            sparePartId: createdSpareParts[j % createdSpareParts.length].id,
            quantity: 1 + (j % 3),
          });
        }
      }
    }
    if (sparePartOrdersData.length > 0) {
      await dbService.db.insert(sparePartOrders).values(sparePartOrdersData);
    }

    // Create payments (для оплаченных заказов)
    const paymentsData: Array<{
      orderId: number;
      amount: string;
      status: boolean;
      paymentMethod: string;
      paymentDate: Date;
    }> = [];
    for (let i = 0; i < createdOrders.length; i++) {
      const order = createdOrders[i];
      // Примерно 70% заказов оплачены
      if (i % 10 < 7) {
        const orderServices = servicesOrdersData.filter(
          so => so.orderId === order.id
        );
        const orderParts = sparePartOrdersData.filter(
          spo => spo.ordersId === order.id
        );
        let totalAmount = 0;

        orderServices.forEach(so => {
          const service = createdServices.find(s => s.id === so.servicesId);
          if (service) {
            totalAmount += service.price * so.quantity;
          }
        });

        orderParts.forEach(spo => {
          const part = createdSpareParts.find(sp => sp.id === spo.sparePartId);
          if (part) {
            totalAmount += parseFloat(part.price.toString()) * spo.quantity;
          }
        });

        paymentsData.push({
          orderId: order.id,
          amount: totalAmount.toString(),
          status: i % 3 === 0 ? false : true, // Большинство оплачено
          paymentMethod: ['cash', 'card', 'online'][i % 3],
          paymentDate: new Date(
            order.createdAt.getTime() + 24 * 60 * 60 * 1000
          ), // На следующий день
        });
      }
    }
    if (paymentsData.length > 0) {
      await dbService.db.insert(payments).values(paymentsData);
    }

    // Create work schedules for employees
    const workSchedulesData: Array<{
      employeeId: number;
      startTime: Date;
      endTime: Date;
      isAvailable: boolean;
    }> = [];
    for (let i = 0; i < createdEmployees.length; i++) {
      const employee = createdEmployees[i];
      // Каждый сотрудник имеет 2-3 записи расписания
      const numSchedules = 2 + (i % 2);
      for (let j = 0; j < numSchedules; j++) {
        const startDate = new Date(2024, 0, 1 + j * 7);
        startDate.setHours(9 + (j % 2) * 4, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 8);

        workSchedulesData.push({
          employeeId: employee.id,
          startTime: startDate,
          endTime: endDate,
          isAvailable: j % 3 !== 0, // Большинство доступны
        });
      }
    }
    await dbService.db.insert(workSchedules).values(workSchedulesData);

    // Create subscriptions for customers
    const subscriptionsData: Array<{
      userId: number;
      employeeId?: number;
      subscriptionName: string;
      subscriptionDescription: string;
      dateStart: Date;
      dateEnd: Date;
    }> = [];
    const customerUsers = createdUsers.filter(
      u => u.roleId === customerRole.id
    );
    for (let i = 0; i < customerUsers.length; i++) {
      const user = customerUsers[i];
      const startDate = new Date(2024, 0, 1 + i * 10);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 6); // Подписка на 6 месяцев

      // Первые подписки - на рабочих, остальные - общие
      const employeeId = i < createdEmployees.length ? createdEmployees[i % createdEmployees.length].id : undefined;

      subscriptionsData.push({
        userId: user.id,
        employeeId,
        subscriptionName: employeeId ? `Подписка на рабочего` : ['Базовый', 'Стандарт', 'Премиум'][i % 3],
        subscriptionDescription: employeeId 
          ? `Подписка на рабочего ${createdEmployees[i % createdEmployees.length].name} ${createdEmployees[i % createdEmployees.length].surName}`
          : `Подписка ${['Базовый', 'Стандарт', 'Премиум'][i % 3]} для ${user.name}`,
        dateStart: startDate,
        dateEnd: endDate,
      });
    }
    await dbService.db.insert(subscriptions).values(subscriptionsData);

    // Create reviews for customers
    const reviewsData: Array<{
      userId: number;
      employeeId?: number;
      description: string;
      rate: number;
      createdAt: Date;
    }> = [];
    for (let i = 0; i < customerUsers.length; i++) {
      const user = customerUsers[i];
      // Каждый клиент может иметь 0-2 отзыва
      const numReviews = i % 3;
      for (let j = 0; j < numReviews; j++) {
        // Часть отзывов на рабочих, часть общие
        const employeeId = j === 0 && i < createdEmployees.length 
          ? createdEmployees[i % createdEmployees.length].id 
          : undefined;
        
        reviewsData.push({
          userId: user.id,
          employeeId,
          description: employeeId
            ? `Отличный рабочий! ${['Очень доволен работой', 'Рекомендую', 'Профессионал'][j]}`
            : `Отличный сервис! ${['Очень доволен', 'Рекомендую', 'Все понравилось'][j]}`,
          rate: 4 + (j % 2), // Рейтинг 4-5
          createdAt: new Date(2024, 0, 15 + i * 5 + j),
        });
      }
    }
    if (reviewsData.length > 0) {
      await dbService.db.insert(reviews).values(reviewsData);
    }

    // Create positions for buying (для отчёта по складам)
    const positionsForBuyingData: Array<{
      supplierId: number;
      quantity: number;
      deliveryDate: Date;
      status: string;
    }> = [];
    for (let i = 0; i < createdSpareParts.length; i++) {
      const supplier = createdSuppliers[i % createdSuppliers.length];

      positionsForBuyingData.push({
        supplierId: supplier.id,
        quantity: 50 + i * 10,
        deliveryDate: new Date(2024, 0, 10 + i * 5),
        status:
          i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'delivered' : 'in_transit',
      });
    }
    const createdPositionsForBuying = await dbService.db
      .insert(positionsForBuying)
      .values(positionsForBuyingData)
      .returning();

    // Create invoices (для оплаченных позиций)
    const invoicesData: Array<{
      positionForBuyingId: number;
      amount: string;
      status: string;
      invoiceDate: Date;
    }> = [];
    for (let i = 0; i < createdPositionsForBuying.length; i++) {
      const position = createdPositionsForBuying[i];
      // Примерно 60% позиций оплачены
      if (i % 5 < 3) {
        const sparePart = createdSpareParts[i % createdSpareParts.length];
        const amount =
          parseFloat(sparePart.price.toString()) * position.quantity;

        invoicesData.push({
          positionForBuyingId: position.id,
          amount: amount.toString(),
          status: 'paid',
          invoiceDate: new Date(
            position.deliveryDate.getTime() - 7 * 24 * 60 * 60 * 1000
          ), // За неделю до доставки
        });
      }
    }
    if (invoicesData.length > 0) {
      await dbService.db.insert(invoices).values(invoicesData);
    }

    console.log('Database seeded successfully!');
    console.log(
      `Created: ${createdUsers.length} users, ${createdEmployees.length} employees, ${createdServices.length} services, ${createdSuppliers.length} suppliers, ${createdSpareParts.length} spare parts, ${createdOrders.length} orders, ${paymentsData.length} payments, ${workSchedulesData.length} work schedules, ${subscriptionsData.length} subscriptions, ${reviewsData.length} reviews`
    );
  } catch (error: unknown) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await dbService.close();
  }
}

void seed();
