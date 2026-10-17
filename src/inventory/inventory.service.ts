import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type EntityManager, Repository } from 'typeorm';
import { toIsoUtcString } from '../common/utils/date';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import {
  Product,
  ProductMeasurementUnit,
} from '../products/entities/product.entity';
import type { SaveInventoryDto } from './dto/save-inventory.dto';
import { InventoryDto, InventoryItemDto } from './dto/inventory.dto';
import {
  InventoryItem,
  MeasurementUnit,
} from './entities/inventory-item.entity';
import { Inventory, InventoryStatus } from './entities/inventory.entity';

export const INVENTORY_LOCKED_MESSAGE = 'Завершену перевірку не можна змінити';

export const INVENTORY_ACTUALS_REQUIRED_MESSAGE =
  'Заповніть фактичну кількість у кожному рядку';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async findAll(): Promise<InventoryDto[]> {
    const inventories = await this.inventoryRepository.find({
      relations: { items: true },
      order: { createdAt: 'DESC', items: { id: 'ASC' } },
    });

    return inventories.map(toDto);
  }

  async findOne(id: number): Promise<InventoryDto> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: { items: true },
      order: { items: { id: 'ASC' } },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory #${id} not found`);
    }

    return toDto(inventory);
  }

  async start(responsible: string): Promise<InventoryDto> {
    return this.inventoryRepository.manager.transaction(async (manager) => {
      const ingredients = await manager.find(Ingredient, {
        order: { id: 'ASC' },
      });
      const products = await manager.find(Product, {
        order: { id: 'ASC' },
      });

      const trackedProducts = products.filter(
        (product): product is Product & { stockQuantity: number } =>
          product.stockQuantity !== null,
      );

      const items = [
        ...ingredients.sort(byName).map((ingredient) =>
          snapshotItem(manager, {
            name: ingredient.name,
            measurementUnit: measurementUnitOf(ingredient),
            expectedQuantity: ingredient.stockQuantity,
          }),
        ),
        ...trackedProducts.sort(byName).map((product) =>
          snapshotItem(manager, {
            name: product.name,
            measurementUnit: productMeasurementUnit(product.measurementUnit),
            expectedQuantity: product.stockQuantity,
          }),
        ),
      ];

      const inventory = manager.create(Inventory);
      inventory.createdAt = new Date();
      inventory.finishedAt = null;
      inventory.status = InventoryStatus.IN_PROGRESS;
      inventory.responsible = responsible;
      inventory.items = items;
      const saved = await manager.save(inventory);

      return toDto(await this.findEntity(manager, saved.id));
    });
  }

  async saveActualQuantities(
    id: number,
    dto: SaveInventoryDto,
  ): Promise<InventoryDto> {
    return this.inventoryRepository.manager.transaction(async (manager) => {
      const inventory = await this.findEntity(manager, id);
      assertInProgress(inventory);

      const itemsById = new Map(inventory.items.map((item) => [item.id, item]));

      for (const update of dto.items) {
        if (update.actualQuantity === undefined) {
          throw new BadRequestException('Вкажіть фактичну кількість');
        }

        const item = itemsById.get(update.id);
        if (!item) {
          throw new BadRequestException(
            `Позицію #${update.id} не знайдено в цій перевірці`,
          );
        }

        item.actualQuantity = update.actualQuantity;
      }

      if (inventory.items.length > 0) {
        await manager.save(inventory.items);
      }

      return toDto(inventory);
    });
  }

  async complete(id: number): Promise<InventoryDto> {
    return this.inventoryRepository.manager.transaction(async (manager) => {
      const inventory = await this.findEntity(manager, id);
      assertInProgress(inventory);

      const missing = inventory.items.some(
        (item) => item.actualQuantity === null,
      );
      if (missing) {
        throw new BadRequestException(INVENTORY_ACTUALS_REQUIRED_MESSAGE);
      }

      const matches = inventory.items.every(
        (item) => item.actualQuantity === item.expectedQuantity,
      );
      inventory.status = matches
        ? InventoryStatus.COMPLETED
        : InventoryStatus.WITH_DIFFERENCES;
      inventory.finishedAt = new Date();
      await manager.save(inventory);

      return toDto(inventory);
    });
  }

  private async findEntity(
    manager: EntityManager,
    id: number,
  ): Promise<Inventory> {
    const inventory = await manager.findOne(Inventory, {
      where: { id },
      relations: { items: true },
      order: { items: { id: 'ASC' } },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory #${id} not found`);
    }

    return inventory;
  }
}

function snapshotItem(
  manager: EntityManager,
  fields: {
    name: string;
    measurementUnit: MeasurementUnit;
    expectedQuantity: number;
  },
): InventoryItem {
  const item = manager.create(InventoryItem);
  item.name = fields.name;
  item.measurementUnit = fields.measurementUnit;
  item.expectedQuantity = fields.expectedQuantity;
  item.actualQuantity = null;
  return item;
}

function assertInProgress(inventory: Inventory): void {
  if (inventory.status !== InventoryStatus.IN_PROGRESS) {
    throw new ConflictException(INVENTORY_LOCKED_MESSAGE);
  }
}

function byName(left: { name: string }, right: { name: string }): number {
  return left.name.localeCompare(right.name, 'uk');
}

function measurementUnitOf(ingredient: Ingredient): MeasurementUnit {
  const unit = ingredient.measurementUnit.trim().toLowerCase();

  switch (unit) {
    case 'g':
    case 'г':
      return MeasurementUnit.G;
    case 'ml':
    case 'мл':
      return MeasurementUnit.ML;
    case 'pcs':
    case 'шт':
    case 'шт.':
      return MeasurementUnit.PCS;
    default:
      throw new BadRequestException(
        `Інгредієнт «${ingredient.name}» має одиницю «${ingredient.measurementUnit}», яку не можна поставити в перевірку`,
      );
  }
}

function productMeasurementUnit(unit: ProductMeasurementUnit): MeasurementUnit {
  switch (unit) {
    case ProductMeasurementUnit.G:
      return MeasurementUnit.G;
    case ProductMeasurementUnit.ML:
      return MeasurementUnit.ML;
    case ProductMeasurementUnit.PCS:
      return MeasurementUnit.PCS;
  }
}

function toDto(inventory: Inventory): InventoryDto {
  return {
    id: inventory.id,
    createdAt: toIsoUtcString(inventory.createdAt),
    finishedAt: inventory.finishedAt
      ? toIsoUtcString(inventory.finishedAt)
      : null,
    status: inventory.status,
    responsible: inventory.responsible,
    items: [...inventory.items].sort((a, b) => a.id - b.id).map(toItemDto),
  };
}

function toItemDto(item: InventoryItem): InventoryItemDto {
  return {
    id: item.id,
    name: item.name,
    measurementUnit: item.measurementUnit,
    expectedQuantity: item.expectedQuantity,
    actualQuantity: item.actualQuantity,
  };
}
