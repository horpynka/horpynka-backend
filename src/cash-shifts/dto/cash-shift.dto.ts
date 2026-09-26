import type { CashShiftStatus } from '../entities/cash-shift.entity';

export class CashShiftDto {
  /** @example 1 */
  id: number;

  /** @example 2024-08-19T08:00:00Z */
  openedAt: string;

  /** @example null */
  closedAt: string | null;

  /** @example 50000 */
  openingBalance: number;

  /** @example 120000 */
  cashSales: number;

  /** @example 85000 */
  cardSales: number;

  /** @example 7500 */
  refunds: number;

  /** @example 162500 */
  closingBalance: number;

  /** @example 25 */
  ordersCount: number;

  /** @example OPEN */
  status: CashShiftStatus;

  /** @example oleksandr@horpynka.local */
  cashierName: string;
}
