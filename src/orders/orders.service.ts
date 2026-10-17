import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, type SelectQueryBuilder, type Repository } from 'typeorm';
import {
  getKyivInclusiveRange,
  InvalidKyivDateError,
  parseKyivDate,
  startOfKyivDay,
} from '../common/utils/date';
import type { FindOrdersQueryDto } from './dto/find-orders-query.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create(createOrderDto);
    return this.orderRepository.save(order);
  }

  async findAll(query: FindOrdersQueryDto = {}): Promise<Order[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const idsQuery = this.orderRepository
      .createQueryBuilder('order')
      .select('order.id')
      .orderBy('order.createdAt', 'DESC')
      .addOrderBy('order.id', 'DESC');

    this.applyFilters(idsQuery, query);
    idsQuery.skip((page - 1) * limit).take(limit);

    const idRows = await idsQuery.getMany();
    const ids = idRows.map((order) => order.id);
    if (ids.length === 0) {
      return [];
    }

    const orders = await this.orderRepository.find({
      where: { id: In(ids) },
      relations: {
        orderItems: {
          dish: true,
          product: true,
        },
      },
    });
    const byId = new Map(orders.map((order) => [order.id, order]));
    return ids.flatMap((id) => {
      const order = byId.get(id);
      return order ? [order] : [];
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        orderItems: {
          dish: {
            category: true,
          },
          product: {
            category: true,
          },
        },
      },
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }

  async removeActiveReceipt(id: number): Promise<Order> {
    const order = await this.findOne(id);
    order.status = OrderStatus.DELETED;
    return this.orderRepository.save(order);
  }

  private applyFilters(
    qb: SelectQueryBuilder<Order>,
    query: FindOrdersQueryDto,
  ): void {
    qb.andWhere('order.status = :status', {
      status: query.status ?? OrderStatus.CREATED,
    });

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        `(CAST(order.id AS TEXT) ILIKE :search ESCAPE '\\' OR CAST(order.status AS TEXT) ILIKE :search ESCAPE '\\')`,
        { search: `%${escapeLike(search)}%` },
      );
    }

    this.applyCreatedAtRange(qb, query.from, query.to);
  }

  private applyCreatedAtRange(
    qb: SelectQueryBuilder<Order>,
    from?: string,
    to?: string,
  ): void {
    if (!from && !to) {
      return;
    }

    try {
      if (from && to) {
        const range = getKyivInclusiveRange(from, to);
        qb.andWhere('order.createdAt >= :start AND order.createdAt < :end', {
          start: range.start,
          end: range.end,
        });
        return;
      }

      if (from) {
        qb.andWhere('order.createdAt >= :start', {
          start: startOfKyivDay(parseKyivDate(from)),
        });
        return;
      }

      if (!to) {
        return;
      }

      const end = getKyivInclusiveRange(to, to).end;
      qb.andWhere('order.createdAt < :end', { end });
    } catch (error) {
      if (error instanceof InvalidKyivDateError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}
