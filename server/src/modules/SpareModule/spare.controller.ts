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
} from '@nestjs/common';
import { SpareService } from './spare.service';
import { SparePartStockResponseDto } from './Dto/spare.response';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';
import { Public } from '../AuthModule/decorators/public.decorator';

@Controller('api/v1.0/stores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpareController {
  constructor(private readonly spareService: SpareService) {}

  @Get()
  @Public()
  async findAll(
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ): Promise<SparePartStockResponseDto[]> {
    return this.spareService.findAll(search, sortBy, sortOrder);
  }

  @Get(':id')
  @Public()
  async findById(@Param('id') id: string): Promise<SparePartStockResponseDto> {
    return this.spareService.findById(id);
  }

  @Post()
  @HttpCode(201)
  @Roles('admin', 'manager')
  async create(): Promise<SparePartStockResponseDto> {
    return this.spareService.create();
  }

  @Put(':id')
  @HttpCode(200)
  @Roles('admin', 'manager')
  async update(): Promise<SparePartStockResponseDto> {
    return this.spareService.update();
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin')
  async delete(@Param('id') id: string): Promise<void> {
    return this.spareService.delete(id);
  }
}
