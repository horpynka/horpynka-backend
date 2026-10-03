import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { FindAllCategoriesResponseDto } from './dto/find-all-response.dto';

const categoryFields = {
  id: true,
  name: true,
} as const;

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      select: categoryFields,
    });

    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }

    return category;
  }

  async findAll(): Promise<FindAllCategoriesResponseDto> {
    const result = await this.categoriesRepository.find({
      relations: {
        dishes: true,
        products: true,
      },
    });

    return {
      dishesCategories: result.filter(
        (category) => category.dishes && category.dishes.length > 0,
      ),
      productsCategories: result.filter(
        (category) => category.products && category.products.length > 0,
      ),
    };
  }
}
