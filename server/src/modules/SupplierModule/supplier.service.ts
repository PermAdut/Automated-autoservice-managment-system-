import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Category, SparePart, PositionForBuying } from './schemas/Supplier';
import { SupplierResponseDto } from './Dto/SupplierResponseDto';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class SupplierService {
  constructor(private readonly databaseService: DatabaseService) {}
  async findAll(): Promise<SupplierResponseDto[]> {
    try {
      const suppliersResult = await this.databaseService.query(
        `
SELECT 
  s.id,
  s.name,
  s.contact,
  s.address,
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'id', pfb.id,
        'quantity', pfb.quantity,
        'deliverDate', pfb."deliveryDate",
        'status', pfb.status
      )
    ) FROM public."PositionsForBuying" pfb
    WHERE pfb."supplierId" = s.id),
    '[]'
  ) as positionsForBuying
FROM public."Suppliers" s
        `,
      );
      return plainToInstance(SupplierResponseDto, suppliersResult, {
        excludeExtraneousValues: true,
      });
    } catch {
      throw new BadRequestException('Failed to fetch suppliers');
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
