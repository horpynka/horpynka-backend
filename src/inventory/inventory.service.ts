import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toIsoUtcString } from '../common/utils/date';
import { InventoryDto, InventoryItemDto } from './dto/inventory.dto';
import { InventoryItem } from './entities/inventory-item.entity';
import { Inventory } from './entities/inventory.entity';

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
