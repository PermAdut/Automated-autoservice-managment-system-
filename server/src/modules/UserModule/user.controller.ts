import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './Dto/create-user.dto';
import { UpdateUserDto } from './Dto/update-user.dto';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';
import { Public } from '../AuthModule/decorators/public.decorator';

@Controller('api/v1.0/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(200)
  @Get('')
  @Public()
  async getUsers(@Query('search') search?: string) {
    return await this.userService.findAll(search);
  }

  @HttpCode(200)
  @Get(':id')
  @Public()
  async getUser(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @HttpCode(200)
  @Get('/rawData/users')
  @Roles('admin', 'manager')
  async getRawUsers() {
    return await this.userService.findAllRaw();
  }

  @HttpCode(200)
  @Get('/rawData/users/:id')
  @Roles('admin', 'manager')
  async getRawUser(@Param('id') id: string) {
    return await this.userService.findByIdRaw(id);
  }

  @HttpCode(201)
  @Post('')
  @Public()
  async createUser(@Body() user: CreateUserDto) {
    return await this.userService.createUser(user);
  }

  @HttpCode(204)
  @Delete(':id')
  @Roles('admin')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }

  @HttpCode(200)
  @Put(':id')
  @Roles('admin', 'manager')
  async updateUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return await this.userService.updateUser(id, user);
  }
}
