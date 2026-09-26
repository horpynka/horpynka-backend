import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum CashShiftStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Entity('cash_shift')
export class CashShift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  openedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date | null;

  @Column({ type: 'integer' })
  openingBalance: number;

  @Column({
    type: 'enum',
    enum: CashShiftStatus,
    default: CashShiftStatus.OPEN,
  })
  status: CashShiftStatus;

  @Column({ name: 'opened_by_user_id' })
  openedByUserId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'opened_by_user_id' })
  openedBy: User;
}
