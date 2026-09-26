import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, type Repository } from 'typeorm';
import { toIsoUtcString } from '../common/utils/date';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { CashShiftDto } from './dto/cash-shift.dto';
import { CashShift, CashShiftStatus } from './entities/cash-shift.entity';

const COMPLETED_SALE_STATUSES = new Set<OrderStatus>([
  OrderStatus.PAID,
  OrderStatus.COMPLETED,
]);

@Injectable()
export class CashShiftsService {
  constructor(
    @InjectRepository(CashShift)
    private readonly cashShiftRepository: Repository<CashShift>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(): Promise<CashShiftDto[]> {
    const shifts = await this.cashShiftRepository.find({
      relations: { openedBy: true },
      order: { openedAt: 'DESC' },
    });

    return this.mapShifts(shifts);
  }

  async findOne(id: number): Promise<CashShiftDto> {
    const shift = await this.cashShiftRepository.findOne({
      where: { id },
      relations: { openedBy: true },
    });

    if (!shift) {
      throw new NotFoundException(`Cash shift #${id} not found`);
    }

    const [dto] = await this.mapShifts([shift]);
    return dto;
  }

  async findCurrent(): Promise<CashShiftDto | null> {
    const shift = await this.cashShiftRepository.findOne({
      where: { status: CashShiftStatus.OPEN },
      relations: { openedBy: true },
      order: { openedAt: 'DESC' },
    });

    if (!shift) {
      return null;
    }

    const [dto] = await this.mapShifts([shift]);
    return dto;
  }

  private async mapShifts(shifts: CashShift[]): Promise<CashShiftDto[]> {
    if (shifts.length === 0) {
      return [];
    }

    const earliestOpenedAt = shifts.reduce(
      (earliest, shift) =>
        shift.openedAt < earliest ? shift.openedAt : earliest,
      shifts[0].openedAt,
    );
    const orders = await this.orderRepository.find({
      where: { createdAt: MoreThanOrEqual(earliestOpenedAt) },
    });

    return shifts.map((shift) => this.toDto(shift, orders));
  }

  private toDto(shift: CashShift, orders: Order[]): CashShiftDto {
    const shiftOrders = orders.filter((order) =>
      this.belongsToShift(order, shift),
    );
    const cashSales = sumBy(shiftOrders, (order) => order.paidWithCash);
    const cardSales = sumBy(shiftOrders, (order) => order.paidWithCard);
    const refunds = sumBy(
      shiftOrders,
      (order) => order.refundedWithCash + order.refundedWithCard,
    );

    return {
      id: shift.id,
      openedAt: toIsoUtcString(shift.openedAt),
      closedAt: shift.closedAt ? toIsoUtcString(shift.closedAt) : null,
      openingBalance: shift.openingBalance,
      cashSales,
      cardSales,
      refunds,
      closingBalance: shift.openingBalance + cashSales - refunds,
      ordersCount: shiftOrders.filter((order) => isCompletedSale(order.status))
        .length,
      status: shift.status,
      cashierName: shift.openedBy.email,
    };
  }

  private belongsToShift(order: Order, shift: CashShift): boolean {
    if (order.createdAt < shift.openedAt) {
      return false;
    }

    if (shift.closedAt && order.createdAt > shift.closedAt) {
      return false;
    }

    return true;
  }
}

function isCompletedSale(status: OrderStatus): boolean {
  return COMPLETED_SALE_STATUSES.has(status);
}

function sumBy(orders: Order[], pick: (order: Order) => number): number {
  return orders.reduce((total, order) => total + pick(order), 0);
}
