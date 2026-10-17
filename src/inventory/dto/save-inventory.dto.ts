import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

export class SaveInventoryItemDto {
  /** @example 1 */
  @IsInt()
  id: number;

  /**
   * Counted amount. Null clears a previously saved count.
   * @example 4800
   */
  @IsOptional()
  @IsInt({ message: 'Фактична кількість має бути цілим числом' })
  @Min(0, { message: 'Фактична кількість не може бути від’ємною' })
  actualQuantity: number | null;
}

export class SaveInventoryDto {
  @IsArray()
  @ArrayUnique((item: SaveInventoryItemDto | undefined) => item?.id, {
    message: 'Позиція повторяється в запиті',
  })
  @ValidateNested({ each: true })
  @Type(() => SaveInventoryItemDto)
  items: SaveInventoryItemDto[];
}
