import {
  Check,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';
import { Dish } from './dish.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Unique(['dishId', 'ingredientId'])
@Check('CHK_dish_ingredient_quantity_positive', '"quantity" > 0')
@Entity('dish_ingredient')
export class DishIngredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'dish_id', nullable: true })
  dishId: number | null;

  @Column({ name: 'ingredient_id', nullable: true })
  ingredientId: number | null;

  /** Measured in the ingredient's `measurementUnit`. */
  @Column({
    type: 'numeric',
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) => (value === null ? value : Number(value)),
    },
  })
  quantity: number;

  @ManyToOne(() => Dish, (dish) => dish.dishIngredients)
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.dishIngredients)
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;
}
