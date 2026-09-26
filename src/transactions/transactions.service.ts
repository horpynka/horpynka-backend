import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, type Repository } from 'typeorm';
import { toIsoUtcString } from '../common/utils/date';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import {
  PaymentMethod,
  TransactionDto,
  TransactionKind,
  TransactionOrderStatus,
} from './dto/transaction.dto';

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

  async findAll(): Promise<TransactionDto[]> {
    const orders = await this.orderRepository.find({
      where: { status: In(TRANSACTION_STATUSES) },
      select: {
        id: true,
        status: true,
        createdAt: true,
        orderPrice: true,
        paidWithCash: true,
        paidWithCard: true,
        refundedWithCash: true,
        refundedWithCard: true,
      },
      order: { createdAt: 'DESC' },
    });

    return orders.map(toDto);
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
