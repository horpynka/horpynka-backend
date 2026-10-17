import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from '../dishes/entities/dish.entity';
import { Product } from '../products/entities/product.entity';
import { MenuItemDto, type MenuItemKind } from './dto/menu-item.dto';

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

const MENU_ITEM_ID = /^(dish|product)-(\d+)$/;

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishesRepository: Repository<Dish>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  /** Cashier menu: only dishes and products that are currently for sale. */
  findAll(): Promise<MenuItemDto[]> {
    return this.loadMenu(true);
  }

  /** Admin menu: every dish and product, including ones taken off sale. */
  findCatalog(): Promise<MenuItemDto[]> {
    return this.loadMenu(false);
  }

  async updateSelling(id: string, selling: boolean): Promise<MenuItemDto> {
    const parsed = parseMenuItemId(id);
    const repository =
      parsed.kind === 'DISH' ? this.dishesRepository : this.productsRepository;

    return this.persistSelling(
      repository,
      parsed.kind,
      parsed.entityId,
      selling,
    );
  }

  private async loadMenu(sellingOnly: boolean): Promise<MenuItemDto[]> {
    const where = sellingOnly ? { selling: true } : undefined;
    const [dishes, products] = await Promise.all([
      this.dishesRepository.find({
        where,
        select: sellableFields,
      }),
      this.productsRepository.find({
        where,
        select: sellableFields,
      }),
    ]);

    return [
      ...dishes.map((dish) => toMenuItem('DISH', dish)),
      ...products.map((product) => toMenuItem('PRODUCT', product)),
    ].sort((a, b) => a.name.localeCompare(b.name, 'uk'));
  }

  private async persistSelling(
    repository: Repository<Dish> | Repository<Product>,
    kind: MenuItemKind,
    entityId: number,
    selling: boolean,
  ): Promise<MenuItemDto> {
    const sellables = repository as Repository<Sellable>;
    const existing = await sellables.findOne({
      where: { id: entityId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(notFoundMessage(kind, entityId));
    }

    await sellables.update(
      { id: entityId },
      { selling, updatedAt: new Date() },
    );

    const updated = await sellables.findOne({
      where: { id: entityId },
      select: sellableFields,
    });

    if (!updated) {
      throw new NotFoundException(notFoundMessage(kind, entityId));
    }

    return toMenuItem(kind, updated);
  }
}

function parseMenuItemId(id: string): {
  kind: MenuItemKind;
  entityId: number;
} {
  const match = MENU_ITEM_ID.exec(id);
  if (!match) {
    throw new BadRequestException(
      'Menu item id must look like dish-12 or product-4',
    );
  }

  return {
    kind: match[1] === 'dish' ? 'DISH' : 'PRODUCT',
    entityId: Number(match[2]),
  };
}

function notFoundMessage(kind: MenuItemKind, entityId: number): string {
  const label = kind === 'DISH' ? 'Dish' : 'Product';
  return `${label} #${entityId} not found`;
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
