import { Category } from './entities/category.entity';

export type FindAllResponse = {
  dishesCategories: Category[];
  productsCategories: Category[];
};
