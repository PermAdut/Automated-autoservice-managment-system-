import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './providers/database/database.service';
import { UserController } from './providers/UserProvider/user.controller';
import { UserService } from './providers/UserProvider/user.service';
@Module({
  imports: [],
  controllers: [AppController, UserController],
  providers: [AppService, DatabaseService, UserService],
  exports: [DatabaseService],
})
export class AppModule {}
