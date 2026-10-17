import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DishIngredient } from '../../dishes/entities/dish-ingredient.entity';

@Entity('ingredient')
export class Ingredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  measurementUnit: string;

  /** Current remainder in `measurementUnit`. Snapshotted when a check starts. */
  @Column({ type: 'integer', default: 0 })
  stockQuantity: number;

  @OneToMany(() => DishIngredient, (di) => di.ingredient)
  dishIngredients: DishIngredient[];
}
