import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashShiftsModule } from '../cash-shifts/cash-shifts.module';
import { Order } from '../orders/entities/order.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), CashShiftsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
