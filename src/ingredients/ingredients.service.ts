import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';

const ingredientFields = {
  id: true,
  name: true,
  measurementUnit: true,
} as const;

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientsRepository: Repository<Ingredient>,
  ) {}

  findAll(): Promise<Ingredient[]> {
    return this.ingredientsRepository.find({
      select: ingredientFields,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Ingredient> {
    const ingredient = await this.ingredientsRepository.findOne({
      where: { id },
      select: ingredientFields,
    });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient #${id} not found`);
    }

    return ingredient;
  }
}
