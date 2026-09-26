import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Inventory } from './inventory.entity';

export enum MeasurementUnit {
  G = 'g',
  ML = 'ml',
  PCS = 'pcs',
}

@Entity('inventory_item')
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'enum', enum: MeasurementUnit })
  measurementUnit: MeasurementUnit;

  @Column({ type: 'integer' })
  expectedQuantity: number;

  @Column({ type: 'integer' })
  actualQuantity: number;

  @Column({ name: 'inventory_id' })
  inventoryId: number;

  @ManyToOne(() => Inventory, (inventory) => inventory.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;
}
