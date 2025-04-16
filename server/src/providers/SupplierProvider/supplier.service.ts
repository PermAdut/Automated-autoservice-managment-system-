import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  Category,
  SparePart,
  Supplier,
  PositionForBuying,
} from './schemas/Supplier';
import {
  CategoryResponseDto,
  PositionForBuyingResponseDto,
  SparePartResponseDto,
  SupplierResponseDto,
} from './Dto/SupplierResponseDto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SupplierService {
  constructor(private readonly databaseService: DatabaseService) {}
  async findAll() {
    const suppliers = (await this.databaseService.query(
      `
      SELECT * FROM "Suppliers"
    `,
    )) as unknown as Supplier[];

    async function createSupplierBody(): Promise<SupplierResponseDto[]> {
      const supplierBody = await Promise.all(
        suppliers.map(async (supplier) => {
          const positionForBuying: PositionForBuying[] =
            await this.getPositionForBuying(supplier.id);
          const sparePart: SparePart[] = await this.getSparePart(
            positionForBuying[0].id,
          );
          const category: Category = await this.getCategory(sparePart[0].id);
          const categoryBody = plainToInstance(CategoryResponseDto, category);
          const sparePartBody: SparePartResponseDto[] = sparePart.map((el) => {
            const body = {
              ...el,
              category: categoryBody,
            };
            return body;
          });
          const positionForBuyingBody: PositionForBuyingResponseDto[] =
            positionForBuying.map((el) => {
              const body = {
                ...el,
                sparePart: sparePartBody,
              };
              return body;
            });
          const supplierBody = {
            ...supplier,
            positionForBuying: positionForBuyingBody,
          };
          return supplierBody;
        }),
      );
      return supplierBody;
    }
    return await createSupplierBody();
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
