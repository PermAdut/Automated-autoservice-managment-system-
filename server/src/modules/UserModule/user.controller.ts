import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  Delete,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserRequestDto } from './Dto/UserRequestDto';
import { UpdateUserDto } from './Dto/UpdateUserDto';

@Controller('api/v1.0/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(200)
  @Get('')
  async getUsers() {
    return await this.userService.findAll();
  }

  @HttpCode(200)
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @HttpCode(200)
  @Get('/rawData/users')
  async getRawUsers() {
    return await this.userService.findAllRaw();
  }

  @HttpCode(200)
  @Get('/rawData/users/:id')
  async getRawUser(@Param('id') id: string) {
    return await this.userService.findByIdRaw(id);
  }

  @HttpCode(201)
  @Post('')
  async createUser(@Body() user: UserRequestDto) {
    return await this.userService.createUser(user);
  }

  @HttpCode(204)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }

  @HttpCode(200)
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return await this.userService.updateUser(id, user);
  }
}
