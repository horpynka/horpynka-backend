import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { Dish } from './entities/dish.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishesRepository: Repository<Dish>,
    private readonly categoriesService: CategoriesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDishDto: CreateDishDto): Promise<Dish> {
    const category = await this.categoriesService.findOne(
      createDishDto.categoryId,
    );

    const dishId = await this.dataSource.transaction(async (manager) => {
      const ingredientIds = createDishDto.ingredients.map(
        (ingredient) => ingredient.ingredientId,
      );
      if (ingredientIds.length > 0) {
        const existing = await manager.find(Ingredient, {
          where: { id: In(ingredientIds) },
          select: { id: true },
        });
        const existingIds = new Set(existing.map(({ id }) => id));
        const missingIds = ingredientIds.filter((id) => !existingIds.has(id));
        if (missingIds.length > 0) {
          throw new NotFoundException(
            `Ingredients ${missingIds.map((id) => `#${id}`).join(', ')} not found`,
          );
        }
      }

      const today = new Date();
      const dish = await manager.save(
        manager.create(Dish, {
          name: createDishDto.name,
          ownPrice: createDishDto.ownPrice,
          sellingPrice: createDishDto.sellingPrice,
          selling: createDishDto.selling,
          category,
          createdAt: today,
          updatedAt: today,
        }),
      );

      await manager.save(
        createDishDto.ingredients.map(({ ingredientId, quantity }) =>
          manager.create(DishIngredient, {
            dishId: dish.id,
            ingredientId,
            quantity,
          }),
        ),
      );

      return dish.id;
    });

    return this.findOne(dishId);
  }

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
