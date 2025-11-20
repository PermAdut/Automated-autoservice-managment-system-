import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { SupplierModule } from './modules/SupplierModule/supplier.module';
import { UserModule } from './modules/UserModule/user.module';
import { EmployeeModule } from './modules/EmployeeModule/employee.module';
import { ServiceModule } from './modules/ServiceModule/service.module';
import { OrderModule } from './modules/OrderModule/order.module';
import { SpareModule } from './modules/SpareModule/spare.module';
import { ReportModule } from './modules/ReportService/report.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EmployeeAvailabilityService } from './modules/EmployeeModule/employee.avalability.service';
import { AuthModule } from './modules/AuthModule/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/AuthModule/guards/jwt-auth.guard';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
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
  providers: [
    AppService,
    EmployeeAvailabilityService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
