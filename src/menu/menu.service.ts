import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from '../dishes/entities/dish.entity';
import { Product } from '../products/entities/product.entity';
import { MenuItemDto, MenuItemKind } from './dto/menu-item.dto';

type Sellable = {
  id: number;
  name: string;
  categoryId: number | null;
  sellingPrice: number;
  ownPrice: number;
  selling: boolean;
  updatedAt: Date | string;
};

const sellableFields = {
  id: true,
  name: true,
  categoryId: true,
  sellingPrice: true,
  ownPrice: true,
  selling: true,
  updatedAt: true,
} as const;

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishesRepository: Repository<Dish>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<MenuItemDto[]> {
    const [dishes, products] = await Promise.all([
      this.dishesRepository.find({
        where: { selling: true },
        select: sellableFields,
      }),
      this.productsRepository.find({
        where: { selling: true },
        select: sellableFields,
      }),
    ]);

    return [
      ...dishes.map((dish) => toMenuItem('DISH', dish)),
      ...products.map((product) => toMenuItem('PRODUCT', product)),
    ].sort((a, b) => a.name.localeCompare(b.name, 'uk'));
  }
}

function toMenuItem(kind: MenuItemKind, item: Sellable): MenuItemDto {
  const prefix = kind === 'DISH' ? 'dish' : 'product';

  return {
    id: `${prefix}-${item.id}`,
    kind,
    entityId: item.id,
    name: item.name,
    categoryId: item.categoryId,
    sellingPrice: item.sellingPrice,
    ownPrice: item.ownPrice,
    selling: item.selling,
    updatedAt: toDateString(item.updatedAt),
  };
}

function toDateString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}
