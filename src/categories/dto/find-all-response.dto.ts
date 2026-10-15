import type { Category } from '../entities/category.entity';
import type { CategoryWithCountsDto } from './category-with-counts.dto';

export class FindAllCategoriesResponseDto {
  dishesCategories: Category[];
  productsCategories: Category[];
  allCategories: CategoryWithCountsDto[];
}
