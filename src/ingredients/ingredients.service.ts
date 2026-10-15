import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { Ingredient } from './entities/ingredient.entity';

export const INGREDIENT_NAME_TAKEN_MESSAGE =
  'Інгредієнт з такою назвою вже існує';

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

  async create(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    const normalizedName = createIngredientDto.name
      .trim()
      .toLocaleLowerCase('uk-UA');
    const existing = await this.ingredientsRepository.find({
      select: { id: true, name: true },
    });
    const duplicate = existing.some(
      (ingredient) =>
        ingredient.name.trim().toLocaleLowerCase('uk-UA') === normalizedName,
    );

    if (duplicate) {
      throw new ConflictException(INGREDIENT_NAME_TAKEN_MESSAGE);
    }

    const ingredient = this.ingredientsRepository.create({
      name: createIngredientDto.name,
      measurementUnit: createIngredientDto.measurementUnit,
    });
    const saved = await this.ingredientsRepository.save(ingredient);

    return this.findOne(saved.id);
  }

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
