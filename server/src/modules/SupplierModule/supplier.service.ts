import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Category, SparePart, PositionForBuying } from './schemas/Supplier';

@Injectable()
export class SupplierService {
  constructor(private readonly databaseService: DatabaseService) {}
  async findAll() {
    try {
      return [];
      // async function createSupplierBody(): Promise<SupplierResponseDto[]> {
      //   const supplierBody = await Promise.all(
      //     suppliers.map(async (supplier) => {
      //       const positionForBuying: PositionForBuying[] =
      //         await this.getPositionForBuying(supplier.id);
      //       if (positionForBuying.length === 0) {
      //         return {
      //           ...supplier,
      //           positionForBuying: [],
      //         };
      //       }

      //   );
      //   return supplierBody;
      // }
      // return await createSupplierBody();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getPositionForBuying(supplierId: number): Promise<PositionForBuying[]> {
    const positionForBuying = await this.databaseService.query(
      `
      SELECT * FROM "PositionForBuying" WHERE "supplierId" = $1
    `,
      [supplierId],
    );
    return positionForBuying as unknown as PositionForBuying[];
  }

  async getSparePart(positionForBuyingId: number): Promise<SparePart[]> {
    const sparePart = await this.databaseService.query(
      `
      SELECT * FROM "SparePart" WHERE "positionForBuyingId" = $1
    `,
      [positionForBuyingId],
    );
    return sparePart as unknown as SparePart[];
  }

  async getCategory(sparePartId: number): Promise<Category> {
    const category = (await this.databaseService.query(
      `
      SELECT * FROM "Category" WHERE "sparePartId" = $1
    `,
      [sparePartId],
    )) as unknown as Category;
    return category;
  }
}
