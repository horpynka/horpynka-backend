export type TransactionKind = 'SALE' | 'REFUND';
export type PaymentMethod = 'CASH' | 'CARD' | 'MIXED';
export type TransactionOrderStatus = 'PAID' | 'CLOSED' | 'REFUNDED';

export class TransactionDto {
  /** @example order-12 */
  id: string;

  /** @example 12 */
  orderId: number;

  /** @example 2024-08-19T12:30:00Z */
  createdAt: string;

  /** @example SALE */
  kind: TransactionKind;

  /** @example CASH */
  paymentMethod: PaymentMethod;

  /** @example 15000 */
  amount: number;

  /** @example 0 */
  refundedAmount: number;

  /** @example CLOSED */
  orderStatus: TransactionOrderStatus;
}
