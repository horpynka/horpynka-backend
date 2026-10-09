import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ProductMeasurementUnit } from '../entities/product.entity';

export class CreateProductDto {
  /** @example Кефір */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  name: string;

  /** @example 1 */
  @IsInt()
  categoryId: number;

  /** @example pcs */
  @IsEnum(ProductMeasurementUnit)
  measurementUnit: ProductMeasurementUnit;

  /** @example 1500 */
  @IsInt()
  @Min(1)
  ownPrice: number;

  /** @example 2200 */
  @IsInt()
  @Min(1)
  sellingPrice: number;

  /** @default true */
  @IsOptional()
  @IsBoolean()
  selling?: boolean;
}
