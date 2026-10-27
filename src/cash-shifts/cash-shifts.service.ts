import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, QueryFailedError, type Repository } from 'typeorm';
import { toIsoUtcString } from '../common/utils/date';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { UsersService } from '../users/users.service';
import { CashShiftDto } from './dto/cash-shift.dto';
import { CloseCashShiftDto } from './dto/close-cash-shift.dto';
import { OpenCashShiftDto } from './dto/open-cash-shift.dto';
import { CashShift, CashShiftStatus } from './entities/cash-shift.entity';

const COMPLETED_SALE_STATUSES = new Set<OrderStatus>([
  OrderStatus.PAID,
  OrderStatus.COMPLETED,
]);

const OPEN_SHIFT_EXISTS_MESSAGE = 'Вже є відкрита зміна';
const SHIFT_ALREADY_CLOSED_MESSAGE = 'Зміну вже закрито';

@Injectable()
export class CashShiftsService {
  constructor(
    @InjectRepository(CashShift)
    private readonly cashShiftRepository: Repository<CashShift>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly usersService: UsersService,
  ) {}

  async open(dto: OpenCashShiftDto, userId: number): Promise<CashShiftDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    let savedId: number;
    try {
      savedId = await this.cashShiftRepository.manager.transaction(
        async (manager) => {
          const openShift = await manager.findOne(CashShift, {
            where: { status: CashShiftStatus.OPEN },
            lock: { mode: 'pessimistic_write' },
          });

          if (openShift) {
            throw new ConflictException(OPEN_SHIFT_EXISTS_MESSAGE);
          }

          const created = manager.create(CashShift, {
            openedAt: new Date(),
            closedAt: null,
            openingBalance: dto.openingBalance,
            closingBalance: null,
            actualClosingBalance: null,
            status: CashShiftStatus.OPEN,
            openedBy: user,
          });
          const saved = await manager.save(created);
          return saved.id;
        },
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (isUniqueViolation(error)) {
        throw new ConflictException(OPEN_SHIFT_EXISTS_MESSAGE);
      }

      throw error;
    }

    return this.findOne(savedId);
  }

  async close(id: number, dto: CloseCashShiftDto): Promise<CashShiftDto> {
    await this.cashShiftRepository.manager.transaction(async (manager) => {
      const shift = await manager.findOne(CashShift, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!shift) {
        throw new NotFoundException(`Зміну #${id} не знайдено`);
      }

      if (shift.status !== CashShiftStatus.OPEN) {
        throw new ConflictException(SHIFT_ALREADY_CLOSED_MESSAGE);
      }

      const closedAt = new Date();
      const orders = await manager.find(Order, {
        where: { createdAt: MoreThanOrEqual(shift.openedAt) },
      });
      const { cashSales, cashRefunds } = this.shiftTotals(
        { openedAt: shift.openedAt, closedAt },
        orders,
      );

      shift.closedAt = closedAt;
      shift.status = CashShiftStatus.CLOSED;
      shift.closingBalance = calculateClosingBalance(
        shift.openingBalance,
        cashSales,
        cashRefunds,
      );
      shift.actualClosingBalance = dto.actualClosingBalance;
      await manager.save(shift);
    });

    return this.findOne(id);
  }

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
      throw new NotFoundException(`Зміну #${id} не знайдено`);
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
    const { cashSales, cardSales, cashRefunds, refunds, ordersCount } =
      this.shiftTotals(shift, orders);
    const closingBalance = recordedClosingBalance(
      shift,
      calculateClosingBalance(shift.openingBalance, cashSales, cashRefunds),
    );

    return {
      id: shift.id,
      openedAt: toIsoUtcString(shift.openedAt),
      closedAt: shift.closedAt ? toIsoUtcString(shift.closedAt) : null,
      openingBalance: shift.openingBalance,
      cashSales,
      cardSales,
      refunds,
      closingBalance,
      actualClosingBalance: shift.actualClosingBalance,
      difference: cashDifference(shift.actualClosingBalance, closingBalance),
      ordersCount,
      status: shift.status,
      cashierName: shift.openedBy.email,
    };
  }

  private shiftTotals(
    shift: Pick<CashShift, 'openedAt' | 'closedAt'>,
    orders: Order[],
  ): {
    cashSales: number;
    cardSales: number;
    cashRefunds: number;
    refunds: number;
    ordersCount: number;
  } {
    const shiftOrders = orders.filter((order) =>
      this.belongsToShift(order, shift),
    );

    return {
      cashSales: sumBy(shiftOrders, (order) => order.paidWithCash),
      cardSales: sumBy(shiftOrders, (order) => order.paidWithCard),
      cashRefunds: sumBy(shiftOrders, (order) => order.refundedWithCash),
      refunds: sumBy(
        shiftOrders,
        (order) => order.refundedWithCash + order.refundedWithCard,
      ),
      ordersCount: shiftOrders.filter((order) => isCompletedSale(order.status))
        .length,
    };
  }

  private belongsToShift(
    order: Order,
    shift: Pick<CashShift, 'openedAt' | 'closedAt'>,
  ): boolean {
    if (order.createdAt < shift.openedAt) {
      return false;
    }

    if (shift.closedAt && order.createdAt > shift.closedAt) {
      return false;
    }

    return true;
  }
}

function calculateClosingBalance(
  openingBalance: number,
  cashSales: number,
  cashRefunds: number,
): number {
  return openingBalance + cashSales - cashRefunds;
}

function cashDifference(
  actualClosingBalance: number | null,
  expectedClosingBalance: number,
): number | null {
  if (actualClosingBalance === null) {
    return null;
  }

  return actualClosingBalance - expectedClosingBalance;
}

function recordedClosingBalance(
  shift: CashShift,
  computedClosingBalance: number,
): number {
  if (
    shift.status === CashShiftStatus.CLOSED &&
    shift.closingBalance !== null
  ) {
    return shift.closingBalance;
  }

  return computedClosingBalance;
}

function isCompletedSale(status: OrderStatus): boolean {
  return COMPLETED_SALE_STATUSES.has(status);
}

function sumBy(orders: Order[], pick: (order: Order) => number): number {
  return orders.reduce((total, order) => total + pick(order), 0);
}

function isUniqueViolation(error: unknown): boolean {
  return postgresErrorCode(error) === '23505';
}

function postgresErrorCode(error: unknown): string | null {
  if (!(error instanceof QueryFailedError)) {
    return null;
  }

  const driverError: unknown = error.driverError;
  if (
    typeof driverError !== 'object' ||
    driverError === null ||
    !('code' in driverError)
  ) {
    return null;
  }

  const { code } = driverError;
  return typeof code === 'string' ? code : null;
}
