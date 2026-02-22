import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BranchService } from './branch.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';

@ApiTags('Branches')
@UseGuards(JwtAuthGuard)
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get()
  @ApiOperation({ summary: 'List all active branches' })
  findAll() {
    return this.branchService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by ID' })
  findOne(@Param('id') id: string) {
    return this.branchService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create branch' })
  create(@Body() body: any) {
    return this.branchService.create(body);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update branch' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.branchService.update(id, body);
  }

  @Get(':id/employees')
  @ApiOperation({ summary: 'Get employees assigned to branch' })
  getEmployees(@Param('id') id: string) {
    return this.branchService.getBranchEmployees(id);
  }

  @Post(':id/employees')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Assign employee to branch' })
  assignEmployee(
    @Param('id') id: string,
    @Body() body: { employeeId: string; isPrimary?: boolean },
  ) {
    return this.branchService.assignEmployee(id, body.employeeId, body.isPrimary);
  }

  @Delete(':id/employees/:employeeId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Remove employee from branch' })
  removeEmployee(@Param('id') id: string, @Param('employeeId') employeeId: string) {
    return this.branchService.removeEmployee(id, employeeId);
  }

  @Get('transfers')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'List store transfers' })
  @ApiQuery({ name: 'fromStoreId', required: false })
  getTransfers(@Query('fromStoreId') fromStoreId?: string) {
    return this.branchService.getTransfers(fromStoreId);
  }

  @Post('transfers')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create store transfer' })
  createTransfer(@Body() body: any) {
    return this.branchService.createTransfer(body);
  }

  @Patch('transfers/:id/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update transfer status' })
  updateTransferStatus(
    @Param('id') id: string,
    @Body() body: { status: 'in_transit' | 'completed' | 'cancelled' },
  ) {
    return this.branchService.updateTransferStatus(id, body.status);
  }
}
