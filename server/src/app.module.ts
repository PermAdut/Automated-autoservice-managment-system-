import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './providers/database/database.service';
import { SupplierModule } from './providers/SupplierProvider/supplier.module';
import { UserModule } from './providers/UserProvider/user.module';

@Module({
  imports: [SupplierModule, UserModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
  exports: [DatabaseService],
})
export class AppModule {}
