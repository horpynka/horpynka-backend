import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  In,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Dish } from './entities/dish.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';

const DISH_IN_ORDERS_MESSAGE =
  'Страву не можна видалити, бо вона є в замовленнях.';

type DishIngredientInput = {
  ingredientId: number;
  quantity: number;
};

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishesRepository: Repository<Dish>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    private readonly categoriesService: CategoriesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDishDto: CreateDishDto): Promise<Dish> {
    const category = await this.categoriesService.findOne(
      createDishDto.categoryId,
    );

    const dishId = await this.dataSource.transaction(async (manager) => {
      await this.assertIngredientsExist(manager, createDishDto.ingredients);

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

  async update(id: number, updateDishDto: UpdateDishDto): Promise<Dish> {
    await this.findOne(id);
    const category = await this.categoriesService.findOne(
      updateDishDto.categoryId,
    );

    await this.dataSource.transaction(async (manager) => {
      await this.assertIngredientsExist(manager, updateDishDto.ingredients);

      const updated = await manager.update(Dish, id, {
        name: updateDishDto.name,
        ownPrice: updateDishDto.ownPrice,
        sellingPrice: updateDishDto.sellingPrice,
        selling: updateDishDto.selling,
        categoryId: category.id,
        updatedAt: new Date(),
      });
      if (!updated.affected) {
        throw new NotFoundException(`Dish #${id} not found`);
      }

      await manager.delete(DishIngredient, { dishId: id });
      if (updateDishDto.ingredients.length > 0) {
        await manager.save(
          updateDishDto.ingredients.map(({ ingredientId, quantity }) =>
            manager.create(DishIngredient, {
              dishId: id,
              ingredientId,
              quantity,
            }),
          ),
        );
      }
    });

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    const inUse = await this.orderItemsRepository.exists({
      where: { dishId: id },
    });
    if (inUse) {
      throw new ConflictException(DISH_IN_ORDERS_MESSAGE);
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.delete(DishIngredient, { dishId: id });
        const deleted = await manager.delete(Dish, id);
        if (!deleted.affected) {
          throw new NotFoundException(`Dish #${id} not found`);
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (isForeignKeyViolation(error)) {
        throw new ConflictException(DISH_IN_ORDERS_MESSAGE);
      }
      throw error;
    }
  }

  private async assertIngredientsExist(
    manager: EntityManager,
    ingredients: DishIngredientInput[],
  ): Promise<void> {
    const ingredientIds = ingredients.map(
      (ingredient) => ingredient.ingredientId,
    );
    if (ingredientIds.length === 0) {
      return;
    }

    const existing = await manager.find(Ingredient, {
      where: { id: In(ingredientIds) },
      select: { id: true },
    });
    const existingIds = new Set(existing.map(({ id }) => id));
    const missingIds = ingredientIds.filter((id) => !existingIds.has(id));
    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Ingredients ${missingIds.map((ingredientId) => `#${ingredientId}`).join(', ')} not found`,
      );
    }
  }
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
