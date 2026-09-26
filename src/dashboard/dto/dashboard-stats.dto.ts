import type { CashShiftDto } from '../../cash-shifts/dto/cash-shift.dto';

export class SalesByDayDto {
  /** @example 2026-09-20 */
  date: string;

  /** @example 315000 */
  sales: number;

  /** @example 37 */
  orders: number;
}

export class PaymentSplitDto {
  /** @example Готівка */
  name: string;

  /** @example 180000 */
  value: number;
}

export class DashboardStatsDto {
  /** @example 315000 */
  todaySales: number;

  /** @example 37 */
  ordersCount: number;

  /** @example 2 */
  openOrders: number;

  /** @example 35 */
  closedOrders: number;

  /** @example 180000 */
  cashSales: number;

  /** @example 135000 */
  cardSales: number;

  /** @example 7500 */
  refunds: number;

  /** @example 8514 */
  averageOrder: number;

  currentShift: CashShiftDto | null;

  salesByDay: SalesByDayDto[];

  paymentSplit: PaymentSplitDto[];
}
