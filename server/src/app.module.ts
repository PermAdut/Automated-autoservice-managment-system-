import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './modules/database/database.service';
import { SupplierModule } from './modules/SupplierModule/supplier.module';
import { UserModule } from './modules/UserModule/user.module';

@Module({
  imports: [SupplierModule, UserModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
  exports: [DatabaseService],
})
export class AppModule {}
