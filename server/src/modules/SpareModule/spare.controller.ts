import { Controller, Get } from '@nestjs/common';
import { SpareService } from './spare.service';
import { SparePartStockResponseDto } from './Dto/spare.response';

@Controller('api/v1.0/stores')
export class SpareController {
  constructor(private readonly spareService: SpareService) {}

  @Get()
  async findAll(): Promise<SparePartStockResponseDto[]> {
    return this.spareService.findAll();
  }
}
