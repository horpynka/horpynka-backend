import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import {
  formatKyivDate,
  getKyivDateWindow,
  getKyivInclusiveRange,
  InvalidKyivDateError,
} from '../common/utils/date';
import { CashShiftsService } from '../cash-shifts/cash-shifts.service';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import type { DashboardStatsQueryDto } from './dto/dashboard-stats-query.dto';
import type {
  DashboardStatsDto,
  PaymentSplitDto,
  SalesByDayDto,
} from './dto/dashboard-stats.dto';

interface DashboardPeriod {
  dates: string[];
  start: Date;
  end: Date;
  /** When set, headline metrics use only this Kyiv date. Bars still use `dates`. */
  metricDate: string | null;
}

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

  async getStats(
    query: DashboardStatsQueryDto = {},
  ): Promise<DashboardStatsDto> {
    const period = this.resolvePeriod(query);

    const [windowOrders, currentShift] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('order')
        .where('order.createdAt >= :start AND order.createdAt < :end', {
          start: period.start,
          end: period.end,
        })
        .getMany(),
      this.cashShiftsService.findCurrent(),
    ]);

    const metricOrders = period.metricDate
      ? windowOrders.filter(
          (order) => formatKyivDate(order.createdAt) === period.metricDate,
        )
      : windowOrders;
    const completedSales = metricOrders.filter((order) =>
      isCompletedSale(order.status),
    );
    const todaySales = sumBy(completedSales, (order) => order.orderPrice);
    const ordersCount = completedSales.length;
    const cashSales = sumBy(metricOrders, (order) => order.paidWithCash);
    const cardSales = sumBy(metricOrders, (order) => order.paidWithCard);
    const refunds = sumBy(
      metricOrders,
      (order) => order.refundedWithCash + order.refundedWithCard,
    );

    return {
      todaySales,
      ordersCount,
      openOrders: metricOrders.filter(
        (order) => order.status === OrderStatus.CREATED,
      ).length,
      closedOrders: metricOrders.filter(
        (order) => order.status === OrderStatus.COMPLETED,
      ).length,
      cashSales,
      cardSales,
      refunds,
      averageOrder: averageKopecks(todaySales, ordersCount),
      currentShift,
      salesByDay: buildSalesByDay(windowOrders, period.dates),
      paymentSplit: buildPaymentSplit(cashSales, cardSales),
    };
  }

  private resolvePeriod(query: DashboardStatsQueryDto): DashboardPeriod {
    if (!query.from && !query.to) {
      const window = getKyivDateWindow(7);
      return {
        dates: window.dates,
        start: window.start,
        end: window.end,
        metricDate: window.today,
      };
    }

    const today = formatKyivDate(new Date());
    const from = query.from ?? query.to ?? today;
    const to = query.to ?? query.from ?? today;

    try {
      return { ...getKyivInclusiveRange(from, to), metricDate: null };
    } catch (error) {
      if (error instanceof InvalidKyivDateError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
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
