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
} from '../modules/database/schema';
import * as bcrypt from 'bcrypt';

async function seed() {
  const dbService = new DatabaseService();

  try {
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

    // Create users (10+)
    const passwordHash: string = await bcrypt.hash('password123', 10);
    const usersData: Array<{
      login: string;
      name: string;
      surName: string;
      email: string;
      phone: string | null;
      passwordHash: string | null;
      oauthProvider?: 'google' | 'local' | null;
      oauthId?: string | null;
      roleId: number;
    }> = [];
    for (let i = 1; i <= 12; i++) {
      usersData.push({
        login: `user${i}`,
        name: `Name${i}`,
        surName: `Surname${i}`,
        email: `user${i}@example.com`,
        phone: `+123456789${i}`,
        passwordHash,
        roleId:
          i <= 2 ? adminRole.id : i <= 4 ? managerRole.id : customerRole.id,
      });
    }
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
    const employeesData: Array<{
      positionId: number;
      hireDate: Date;
      salary: string;
    }> = [];
    for (let i = 0; i < 12; i++) {
      employeesData.push({
        positionId: createdPositions[i % createdPositions.length].id,
        hireDate: new Date(2020 + i, 0, 1),
        salary: (30000 + i * 5000).toString(),
      });
    }
    const createdEmployees = await dbService.db
      .insert(employees)
      .values(employeesData)
      .returning();

    // Create services (10+)
    const servicesData: Array<{
      name: string;
      description: string;
      price: string;
    }> = [];
    for (let i = 1; i <= 12; i++) {
      servicesData.push({
        name: `Service ${i}`,
        description: `Description for service ${i}`,
        price: (100 + i * 10).toString(),
      });
    }
    const createdServices = await dbService.db
      .insert(services)
      .values(servicesData)
      .returning();

    // Create suppliers (10+)
    const suppliersData: Array<{
      name: string;
      contact: string;
      address: string;
    }> = [];
    for (let i = 1; i <= 12; i++) {
      suppliersData.push({
        name: `Supplier ${i}`,
        contact: `contact${i}@supplier.com`,
        address: `Address ${i}, City ${i}`,
      });
    }
    const createdSuppliers = await dbService.db
      .insert(suppliers)
      .values(suppliersData)
      .returning();

    // Create categories
    const categoriesData = [
      { name: 'Engine Parts', description: 'Engine components' },
      { name: 'Brake System', description: 'Brake components' },
      { name: 'Suspension', description: 'Suspension parts' },
      { name: 'Electrical', description: 'Electrical components' },
    ];
    const createdCategories = await dbService.db
      .insert(categories)
      .values(categoriesData)
      .returning();

    // Create spare parts (10+)
    const sparePartsData: Array<{
      name: string;
      partNumber: string;
      price: string;
      categoryId: number;
    }> = [];
    for (let i = 1; i <= 12; i++) {
      sparePartsData.push({
        name: `Spare Part ${i}`,
        partNumber: `PART-${i.toString().padStart(4, '0')}`,
        price: (50 + i * 5).toString(),
        categoryId: createdCategories[i % createdCategories.length].id,
      });
    }
    const createdSpareParts = await dbService.db
      .insert(spareParts)
      .values(sparePartsData)
      .returning();

    // Create stores
    const storesData = [
      { location: 'Warehouse A' },
      { location: 'Warehouse B' },
      { location: 'Main Store' },
    ];
    const createdStores = await dbService.db
      .insert(stores)
      .values(storesData)
      .returning();

    // Create spare part store relationships
    const sparePartStoreData: Array<{
      sparePartId: number;
      storeId: number;
      quantity: number;
    }> = [];
    for (let i = 0; i < createdSpareParts.length; i++) {
      sparePartStoreData.push({
        sparePartId: createdSpareParts[i].id,
        storeId: createdStores[i % createdStores.length].id,
        quantity: 10 + i,
      });
    }
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
