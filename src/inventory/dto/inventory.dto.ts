import type { MeasurementUnit } from '../entities/inventory-item.entity';
import type { InventoryStatus } from '../entities/inventory.entity';

export class InventoryItemDto {
  /** @example 1 */
  id: number;

  /** @example Гречка */
  name: string;

  /** @example g */
  measurementUnit: MeasurementUnit;

  /** @example 5000 */
  expectedQuantity: number;

  /** @example 4800 */
  actualQuantity: number;
}

export class InventoryDto {
  /** @example 1 */
  id: number;

  /** @example 2024-08-19T09:00:00Z */
  createdAt: string;

  /** @example null */
  finishedAt: string | null;

  /** @example IN_PROGRESS */
  status: InventoryStatus;

  /** @example Марія Коваленко */
  responsible: string;

  items: InventoryItemDto[];
}
