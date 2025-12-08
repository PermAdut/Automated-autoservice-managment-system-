import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { SpareService } from './spare.service';
import { SparePartStockResponseDto } from './Dto/spare.response';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';
import { Public } from '../AuthModule/decorators/public.decorator';
import {
  CreateSpareStockDto,
  UpdateSpareStockDto,
} from './Dto/create-spare-stock.dto';

@Controller('api/v1.0/stores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpareController {
  constructor(private readonly spareService: SpareService) {}

  @Get()
  @Public()
  async findAll(
    @Query('search') search?: string,
    @Query('sortBy')
    sortBy: 'name' | 'quantity' | 'price' | 'id' | undefined = 'name',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<SparePartStockResponseDto[]> {
    return this.spareService.findAll(search, sortBy, sortOrder);
  }

  @Get(':id')
  @Public()
  async findById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<SparePartStockResponseDto> {
    return this.spareService.findById(id);
  }

  @Post()
  @HttpCode(201)
  @Roles('admin', 'manager')
  async create(
    @Body() body: CreateSpareStockDto
  ): Promise<SparePartStockResponseDto> {
    return this.spareService.createWithPayload(body);
  }

  @Put(':id')
  @HttpCode(200)
  @Roles('admin', 'manager')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateSpareStockDto
  ): Promise<SparePartStockResponseDto> {
    return this.spareService.updateWithPayload(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.spareService.delete(id);
  }

  @Get('meta/stores')
  @Public()
  async getStoresMeta() {
    return this.spareService.getStoresList();
  }

  @Get('meta/categories')
  @Public()
  async getCategoriesMeta() {
    return this.spareService.getCategoriesList();
  }
}
