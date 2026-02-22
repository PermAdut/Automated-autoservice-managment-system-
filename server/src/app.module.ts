import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/AuthModule/auth.module';
import { JwtAuthGuard } from './modules/AuthModule/guards/jwt-auth.guard';
import { SupplierModule } from './modules/SupplierModule/supplier.module';
import { UserModule } from './modules/UserModule/user.module';
import { EmployeeModule } from './modules/EmployeeModule/employee.module';
import { EmployeeAvailabilityService } from './modules/EmployeeModule/employee.avalability.service';
import { ServiceModule } from './modules/ServiceModule/service.module';
import { OrderModule } from './modules/OrderModule/order.module';
import { SpareModule } from './modules/SpareModule/spare.module';
import { ReportModule } from './modules/ReportService/report.module';
import { BookingModule } from './modules/BookingModule/booking.module';
import { NotificationModule } from './modules/NotificationModule/notification.module';
import { DiagnosticsModule } from './modules/DiagnosticsModule/diagnostics.module';
import { PartnersModule } from './modules/PartnersModule/partners.module';
import { BranchModule } from './modules/BranchModule/branch.module';
import { WarrantyModule } from './modules/WarrantyModule/warranty.module';
import { CorporateModule } from './modules/CorporateModule/corporate.module';
import { PromotionsModule } from './modules/PromotionsModule/promotions.module';
import { VehicleModule } from './modules/VehicleModule/vehicle.module';
import { TenantModule } from './modules/TenantModule/tenant.module';
import { AnalyticsModule } from './modules/AnalyticsModule/analytics.module';
import { StorageModule } from './modules/StorageModule/storage.module';

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
    BookingModule,
    NotificationModule,
    DiagnosticsModule,
    PartnersModule,
    BranchModule,
    WarrantyModule,
    CorporateModule,
    PromotionsModule,
    VehicleModule,
    TenantModule,
    AnalyticsModule,
    StorageModule,
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
