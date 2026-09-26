import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { CashShiftsController } from './cash-shifts.controller';
import { CashShiftsService } from './cash-shifts.service';
import { CashShift } from './entities/cash-shift.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CashShift, Order])],
  controllers: [CashShiftsController],
  providers: [CashShiftsService],
  exports: [CashShiftsService],
})
export class CashShiftsModule {}
