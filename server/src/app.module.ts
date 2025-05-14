import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './modules/database/database.service';
import { SupplierModule } from './modules/SupplierModule/supplier.module';
import { UserModule } from './modules/UserModule/user.module';
import { EmployeeModule } from './modules/EmployeeModule/employee.module';
import { ServiceModule } from './modules/ServiceModule/service.module';
import { OrderModule } from './modules/OrderModule/order.module';
import { SpareModule } from './modules/SpareModule/spare.module';
import { ReportModule } from './modules/ReportService/report.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EmployeeAvailabilityService } from './modules/EmployeeModule/employee.avalability.service';
@Module({
  imports: [
    SupplierModule,
    UserModule,
    EmployeeModule,
    ServiceModule,
    OrderModule,
    SpareModule,
    ReportModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService, EmployeeAvailabilityService],
  exports: [DatabaseService],
})
export class AppModule {}
