import type { Category } from '../entities/category.entity';

export class FindAllCategoriesResponseDto {
  dishesCategories: Category[];
  productsCategories: Category[];
}
