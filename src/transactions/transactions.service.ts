import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import {
  getKyivInclusiveRange,
  InvalidKyivDateError,
  parseKyivDate,
  startOfKyivDay,
  toIsoUtcString,
} from '../common/utils/date';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import {
  PaymentMethod,
  TransactionDto,
  TransactionKind,
  TransactionOrderStatus,
} from './dto/transaction.dto';
import type { TransactionsQueryDto } from './dto/transactions-query.dto';

const TRANSACTION_STATUSES = [
  OrderStatus.PAID,
  OrderStatus.COMPLETED,
  OrderStatus.REFUNDED,
];

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(query: TransactionsQueryDto = {}): Promise<TransactionDto[]> {
    const { start, end } = resolveCreatedAtRange(query);

    const ordersQuery = this.orderRepository
      .createQueryBuilder('order')
      .select([
        'order.id',
        'order.status',
        'order.createdAt',
        'order.orderPrice',
        'order.paidWithCash',
        'order.paidWithCard',
        'order.refundedWithCash',
        'order.refundedWithCard',
      ])
      .where('order.status IN (:...statuses)', {
        statuses: TRANSACTION_STATUSES,
      })
      .orderBy('order.createdAt', 'DESC');

    if (start) {
      ordersQuery.andWhere('order.createdAt >= :start', { start });
    }
    if (end) {
      ordersQuery.andWhere('order.createdAt < :end', { end });
    }

    const orders = await ordersQuery.getMany();
    return orders.map(toDto);
  }
}

function resolveCreatedAtRange(query: TransactionsQueryDto): {
  start?: Date;
  end?: Date;
} {
  const { from, to } = query;
  if (!from && !to) {
    return {};
  }

  try {
    if (from && to) {
      const range = getKyivInclusiveRange(from, to);
      return { start: range.start, end: range.end };
    }

    if (from) {
      return { start: startOfKyivDay(parseKyivDate(from)) };
    }

    if (to) {
      return { end: getKyivInclusiveRange(to, to).end };
    }

    return {};
  } catch (error) {
    if (error instanceof InvalidKyivDateError) {
      throw new BadRequestException(error.message);
    }
    throw error;
  }
}

function toDto(order: Order): TransactionDto {
  const refundedAmount = order.refundedWithCash + order.refundedWithCard;

  return {
    id: `order-${order.id}`,
    orderId: order.id,
    createdAt: toIsoUtcString(order.createdAt),
    kind: toKind(refundedAmount),
    paymentMethod: toPaymentMethod(order.paidWithCash, order.paidWithCard),
    amount: order.orderPrice,
    refundedAmount,
    orderStatus: toOrderStatus(order.status),
  };
}

function toKind(refundedAmount: number): TransactionKind {
  return refundedAmount > 0 ? 'REFUND' : 'SALE';
}

function toPaymentMethod(
  paidWithCash: number,
  paidWithCard: number,
): PaymentMethod {
  if (paidWithCash > 0 && paidWithCard > 0) {
    return 'MIXED';
  }

  if (paidWithCash > 0) {
    return 'CASH';
  }

  return 'CARD';
}

function toOrderStatus(status: OrderStatus): TransactionOrderStatus {
  if (status === OrderStatus.COMPLETED) {
    return 'CLOSED';
  }

  if (status === OrderStatus.REFUNDED) {
    return 'REFUNDED';
  }

  return 'PAID';
}
