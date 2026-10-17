import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Dish } from '../../dishes/entities/dish.entity';
import { Product } from '../../products/entities/product.entity';

export enum DiscountType {
  NONE = 'NONE',
  PERCENT = 'PERCENT',
  AMOUNT = 'AMOUNT',
}

@Check(
  `(("dish_id" IS NOT NULL AND "product_id" IS NULL) OR ("dish_id" IS NULL AND "product_id" IS NOT NULL))`,
)
@Entity('order_item')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  sellingPrice: number;

  @Column({ type: 'text', nullable: true })
  discount: string | null;

  @Column({ type: 'text', default: DiscountType.NONE })
  discountType: DiscountType;

  @Column({ name: 'dish_id', nullable: true })
  dishId: number | null;

  @Column({ name: 'product_id', nullable: true })
  productId: number | null;

  @Column({ name: 'order_id', nullable: true })
  orderId: number | null;

  @ManyToOne(() => Dish)
  @JoinColumn({ name: 'dish_id' })
  dish: Dish | null;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product | null;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
