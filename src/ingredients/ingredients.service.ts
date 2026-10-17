import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { DishIngredient } from '../dishes/entities/dish-ingredient.entity';
import {
  CreateIngredientDto,
  IngredientMeasurementUnit,
} from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Ingredient } from './entities/ingredient.entity';

export const INGREDIENT_NAME_TAKEN_MESSAGE =
  'Інгредієнт з такою назвою вже існує';

export const INGREDIENT_UNIT_LOCKED_MESSAGE =
  'Одиницю не можна змінити, поки інгредієнт є в складі страв';

const ingredientFields = {
  id: true,
  name: true,
  measurementUnit: true,
  stockQuantity: true,
} as const;

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientsRepository: Repository<Ingredient>,
    @InjectRepository(DishIngredient)
    private readonly dishIngredientsRepository: Repository<DishIngredient>,
  ) {}

  async create(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    await this.assertUniqueName(createIngredientDto.name);

    const ingredient = this.ingredientsRepository.create({
      name: createIngredientDto.name,
      measurementUnit: createIngredientDto.measurementUnit,
      stockQuantity: 0,
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

  async update(
    id: number,
    updateIngredientDto: UpdateIngredientDto,
  ): Promise<Ingredient> {
    const ingredient = await this.findOne(id);
    await this.assertUniqueName(updateIngredientDto.name, id);

    if (
      updateIngredientDto.measurementUnit !==
      (ingredient.measurementUnit as IngredientMeasurementUnit)
    ) {
      const usages = await this.findUsages(id);
      if (usages.length > 0) {
        throw new ConflictException(INGREDIENT_UNIT_LOCKED_MESSAGE);
      }
    }

    await this.ingredientsRepository.update(id, {
      name: updateIngredientDto.name,
      measurementUnit: updateIngredientDto.measurementUnit,
    });

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    const usages = await this.findUsages(id);
    if (usages.length > 0) {
      throw new ConflictException(ingredientInUseMessage(dishNames(usages)));
    }

    try {
      await this.ingredientsRepository.delete(id);
    } catch (error) {
      if (!isForeignKeyViolation(error)) {
        throw error;
      }

      const racedUsages = await this.findUsages(id);
      throw new ConflictException(
        ingredientInUseMessage(dishNames(racedUsages)),
      );
    }
  }

  private findUsages(ingredientId: number): Promise<DishIngredient[]> {
    return this.dishIngredientsRepository
      .createQueryBuilder('usage')
      .leftJoin('usage.dish', 'dish')
      .select(['usage.id', 'usage.dishId', 'dish.id', 'dish.name'])
      .where('usage.ingredientId = :ingredientId', { ingredientId })
      .getMany();
  }

  private async assertUniqueName(
    name: string,
    excludeId?: number,
  ): Promise<void> {
    const normalizedName = name.trim().toLowerCase();
    const ingredients = await this.ingredientsRepository.find({
      select: { id: true, name: true },
    });
    const duplicate = ingredients.find(
      (ingredient) =>
        ingredient.id !== excludeId &&
        ingredient.name.trim().toLowerCase() === normalizedName,
    );

    if (duplicate) {
      throw new ConflictException(INGREDIENT_NAME_TAKEN_MESSAGE);
    }
  }
}

function dishNames(usages: DishIngredient[]): string[] {
  const names = new Map<number, string>();

  for (const usage of usages) {
    const name = usage.dish?.name?.trim();
    if (usage.dish && name) {
      names.set(usage.dish.id, name);
    }
  }

  return [...names.values()].sort((left, right) =>
    left.localeCompare(right, 'uk'),
  );
}

export function ingredientInUseMessage(names: string[]): string {
  const base =
    'Інгредієнт використовується в стравах, спочатку приберіть його з їхнього складу';

  if (names.length === 0) {
    return `${base}.`;
  }

  return `${base}: ${names.join(', ')}.`;
}

function isForeignKeyViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError: unknown = error.driverError;

  return (
    typeof driverError === 'object' &&
    driverError !== null &&
    'code' in driverError &&
    driverError.code === '23503'
  );
}
