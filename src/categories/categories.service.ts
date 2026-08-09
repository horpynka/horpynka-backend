import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { FindAllResponse } from './types';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<FindAllResponse> {
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
