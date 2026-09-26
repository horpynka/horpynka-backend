import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { formatKyivDate, getKyivDateWindow } from '../common/utils/date';
import { CashShiftsService } from '../cash-shifts/cash-shifts.service';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import type {
  DashboardStatsDto,
  PaymentSplitDto,
  SalesByDayDto,
} from './dto/dashboard-stats.dto';

const COMPLETED_SALE_STATUSES = new Set<OrderStatus>([
  OrderStatus.PAID,
  OrderStatus.COMPLETED,
]);

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly cashShiftsService: CashShiftsService,
  ) {}

  async getStats(): Promise<DashboardStatsDto> {
    const { today, dates, start, end } = getKyivDateWindow(7);

    const [windowOrders, currentShift] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('order')
        .where('order.createdAt >= :start AND order.createdAt < :end', {
          start,
          end,
        })
        .getMany(),
      this.cashShiftsService.findCurrent(),
    ]);

    const todayOrders = windowOrders.filter(
      (order) => formatKyivDate(order.createdAt) === today,
    );
    const completedToday = todayOrders.filter((order) =>
      isCompletedSale(order.status),
    );
    const todaySales = sumBy(completedToday, (order) => order.orderPrice);
    const ordersCount = completedToday.length;
    const cashSales = sumBy(todayOrders, (order) => order.paidWithCash);
    const cardSales = sumBy(todayOrders, (order) => order.paidWithCard);
    const refunds = sumBy(
      todayOrders,
      (order) => order.refundedWithCash + order.refundedWithCard,
    );

    return {
      todaySales,
      ordersCount,
      openOrders: todayOrders.filter(
        (order) => order.status === OrderStatus.CREATED,
      ).length,
      closedOrders: todayOrders.filter(
        (order) => order.status === OrderStatus.COMPLETED,
      ).length,
      cashSales,
      cardSales,
      refunds,
      averageOrder: averageKopecks(todaySales, ordersCount),
      currentShift,
      salesByDay: buildSalesByDay(windowOrders, dates),
      paymentSplit: buildPaymentSplit(cashSales, cardSales),
    };
  }
}

function isCompletedSale(status: OrderStatus): boolean {
  return COMPLETED_SALE_STATUSES.has(status);
}

function sumBy(orders: Order[], pick: (order: Order) => number): number {
  return orders.reduce((total, order) => total + pick(order), 0);
}

function averageKopecks(total: number, count: number): number {
  if (count <= 0) {
    return 0;
  }
  return Math.round(total / count);
}

function buildSalesByDay(orders: Order[], dates: string[]): SalesByDayDto[] {
  const byDate = new Map(dates.map((date) => [date, { sales: 0, orders: 0 }]));

  for (const order of orders) {
    if (!isCompletedSale(order.status)) {
      continue;
    }
    const bucket = byDate.get(formatKyivDate(order.createdAt));
    if (!bucket) {
      continue;
    }
    bucket.sales += order.orderPrice;
    bucket.orders += 1;
  }

  return dates.map((date) => ({
    date,
    sales: byDate.get(date)?.sales ?? 0,
    orders: byDate.get(date)?.orders ?? 0,
  }));
}

function buildPaymentSplit(
  cashSales: number,
  cardSales: number,
): PaymentSplitDto[] {
  return [
    { name: 'Готівка', value: cashSales },
    { name: 'Картка', value: cardSales },
  ];
}
