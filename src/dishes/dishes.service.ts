import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from './entities/dish.entity';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishesRepository: Repository<Dish>,
  ) {}

  findAll(): Promise<Dish[]> {
    return this.dishesRepository.find({
      relations: {
        category: true,
        dishIngredients: {
          ingredient: true,
        },
      },
    });
  }

  async findOne(id: number): Promise<Dish> {
    const dish = await this.dishesRepository.findOne({
      where: { id },
      relations: {
        category: true,
        dishIngredients: {
          ingredient: true,
        },
      },
    });
    if (!dish) {
      throw new NotFoundException(`Dish #${id} not found`);
    }
    return dish;
  }
}
