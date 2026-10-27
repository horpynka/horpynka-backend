import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FindAllCategoriesResponseDto } from './dto/find-all-response.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const categoryFields = {
  id: true,
  name: true,
} as const;

const DUPLICATE_CATEGORY_NAME = 'Категорія з такою назвою вже існує';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    await this.assertUniqueName(createCategoryDto.name);

    const category = this.categoriesRepository.create({
      name: createCategoryDto.name,
    });
    const saved = await this.categoriesRepository.save(category);

    return { id: saved.id, name: saved.name };
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      select: categoryFields,
    });

    if (!category) {
      throw new NotFoundException(`Категорію #${id} не знайдено`);
    }

    return category;
  }

  async findAll(): Promise<FindAllCategoriesResponseDto> {
    const result = await this.categoriesRepository.find({
      relations: {
        dishes: true,
        products: true,
      },
      order: { name: 'ASC' },
    });

    return {
      dishesCategories: result.filter(
        (category) => category.dishes && category.dishes.length > 0,
      ),
      productsCategories: result.filter(
        (category) => category.products && category.products.length > 0,
      ),
      allCategories: result.map((category) => ({
        id: category.id,
        name: category.name,
        productsCount: category.products?.length ?? 0,
        dishesCount: category.dishes?.length ?? 0,
      })),
    };
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.findOne(id);
    await this.assertUniqueName(updateCategoryDto.name, id);

    category.name = updateCategoryDto.name;
    const saved = await this.categoriesRepository.save(category);

    return { id: saved.id, name: saved.name };
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    const counts = await this.countLinks(id);

    if (counts.productsCount > 0 || counts.dishesCount > 0) {
      throw new ConflictException(categoryInUseMessage(counts));
    }

    try {
      await this.categoriesRepository.delete(id);
    } catch (error) {
      if (!isForeignKeyViolation(error)) {
        throw error;
      }

      throw new ConflictException(
        categoryInUseMessage(await this.countLinks(id)),
      );
    }
  }

  private async assertUniqueName(
    name: string,
    currentId?: number,
  ): Promise<void> {
    const normalizedName = name.toLowerCase();
    const categories = await this.categoriesRepository.find({
      select: categoryFields,
    });
    const duplicate = categories.find(
      (category) =>
        category.id !== currentId &&
        category.name.trim().toLowerCase() === normalizedName,
    );

    if (duplicate) {
      throw new BadRequestException(DUPLICATE_CATEGORY_NAME);
    }
  }

  private async countLinks(id: number): Promise<{
    productsCount: number;
    dishesCount: number;
  }> {
    const raw = await this.categoriesRepository
      .createQueryBuilder('category')
      .leftJoin('category.products', 'product')
      .leftJoin('category.dishes', 'dish')
      .where('category.id = :id', { id })
      .select('COUNT(DISTINCT product.id)', 'productsCount')
      .addSelect('COUNT(DISTINCT dish.id)', 'dishesCount')
      .getRawOne<{ productsCount: string; dishesCount: string }>();

    return {
      productsCount: Number(raw?.productsCount ?? 0),
      dishesCount: Number(raw?.dishesCount ?? 0),
    };
  }
}

function categoryInUseMessage(counts: {
  productsCount: number;
  dishesCount: number;
}): string {
  return `Неможливо видалити категорію: товарів — ${counts.productsCount}, страв — ${counts.dishesCount}.`;
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
