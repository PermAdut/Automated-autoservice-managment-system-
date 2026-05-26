import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BranchService } from './branch.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';
import { resolveBranchFilter } from '../AuthModule/helpers/branch-scope.helper';
import type { AuthenticatedRequest } from '../AuthModule/types/auth.types';

@ApiTags('Branches')
@UseGuards(JwtAuthGuard)
@Controller('api/v1.0/branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

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
  createTransfer(@Body() body: {
    fromStoreId: string;
    toStoreId: string;
    sparePartId: string;
    quantity: number;
    initiatedById?: string;
    notes?: string;
  }) {
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

  @Get()
  @ApiOperation({ summary: 'List branches (manager sees own branch only)' })
  findAll(@Request() req: AuthenticatedRequest) {
    const branchId = resolveBranchFilter(req.user);
    return this.branchService.findAll(true, branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by ID' })
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const scope = resolveBranchFilter(req.user);
    if (scope && scope !== id) {
      return this.branchService.findById(scope);
    }
    return this.branchService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create branch' })
  create(@Body() body: {
    name: string;
    address: string;
    city?: string;
    phone?: string;
    email?: string;
    managerId?: string;
    workingHours?: string;
  }) {
    return this.branchService.create(body);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update branch' })
  update(@Param('id') id: string, @Body() body: Partial<{
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    managerId: string;
    workingHours: string;
    isActive: boolean;
  }>, @Request() req: AuthenticatedRequest) {
    const scope = resolveBranchFilter(req.user);
    const targetId = scope ?? id;
    return this.branchService.update(targetId, body);
  }

  @Get(':id/posts')
  @ApiOperation({ summary: 'List production posts for branch' })
  getPosts(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const scope = resolveBranchFilter(req.user);
    return this.branchService.getPosts(scope ?? id);
  }

  @Post(':id/posts')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create production post' })
  createPost(
    @Param('id') id: string,
    @Body() body: { name: string },
    @Request() req: AuthenticatedRequest,
  ) {
    const scope = resolveBranchFilter(req.user);
    return this.branchService.createPost(scope ?? id, body.name);
  }

  @Patch(':id/posts/:postId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update production post' })
  updatePost(
    @Param('postId') postId: string,
    @Body() body: Partial<{ name: string; isActive: boolean }>,
  ) {
    return this.branchService.updatePost(postId, body);
  }

  @Delete(':id/posts/:postId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Delete production post' })
  deletePost(@Param('postId') postId: string) {
    return this.branchService.deletePost(postId);
  }

  @Get(':id/employees')
  @ApiOperation({ summary: 'Get employees assigned to branch' })
  getEmployees(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const scope = resolveBranchFilter(req.user);
    return this.branchService.getBranchEmployees(scope ?? id);
  }

  @Post(':id/employees')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Assign employee to branch' })
  assignEmployee(
    @Param('id') id: string,
    @Body() body: { employeeId: string; isPrimary?: boolean },
    @Request() req: AuthenticatedRequest,
  ) {
    const scope = resolveBranchFilter(req.user);
    return this.branchService.assignEmployee(scope ?? id, body.employeeId, body.isPrimary);
  }

  @Delete(':id/employees/:employeeId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Remove employee from branch' })
  removeEmployee(@Param('id') id: string, @Param('employeeId') employeeId: string) {
    return this.branchService.removeEmployee(id, employeeId);
  }
}
