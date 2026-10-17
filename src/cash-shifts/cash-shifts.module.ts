import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Order } from '../orders/entities/order.entity';
import { UsersModule } from '../users/users.module';
import { CashShiftsController } from './cash-shifts.controller';
import { CashShiftsService } from './cash-shifts.service';
import { CashShift } from './entities/cash-shift.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CashShift, Order]),
    AuthModule,
    UsersModule,
  ],
  controllers: [CashShiftsController],
  providers: [CashShiftsService],
  exports: [CashShiftsService],
})
export class CashShiftsModule {}
