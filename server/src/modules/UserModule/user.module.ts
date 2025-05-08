import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DatabaseService } from '../database/database.service';
@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, DatabaseService],
  exports: [UserService],
})
export class UserModule {}
