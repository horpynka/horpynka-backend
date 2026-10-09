import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

export enum ProductMeasurementUnit {
  G = 'g',
  ML = 'ml',
  PCS = 'pcs',
}

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'integer' })
  ownPrice: number;

  @Column({ type: 'integer' })
  sellingPrice: number;

  @Column({
    type: 'enum',
    enum: ProductMeasurementUnit,
    enumName: 'product_measurement_unit_enum',
  })
  measurementUnit: ProductMeasurementUnit;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number | null;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'boolean', default: true })
  selling: boolean;

  @Column({ type: 'date' })
  createdAt: Date;

  @Column({ type: 'date' })
  updatedAt: Date;
}
