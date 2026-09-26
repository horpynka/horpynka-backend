import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InventoryItem } from './inventory-item.entity';

export enum InventoryStatus {
  COMPLETED = 'COMPLETED',
  WITH_DIFFERENCES = 'WITH_DIFFERENCES',
  IN_PROGRESS = 'IN_PROGRESS',
}

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date | null;

  @Column({ type: 'enum', enum: InventoryStatus })
  status: InventoryStatus;

  @Column({ type: 'text' })
  responsible: string;

  @OneToMany(() => InventoryItem, (item) => item.inventory, { cascade: true })
  items: InventoryItem[];
}
