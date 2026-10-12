import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateDishIngredientDto {
  /** @example 1 */
  @IsInt()
  ingredientId: number;

  /**
   * Measured in the ingredient's `measurementUnit`.
   * @example 150
   */
  @ApiProperty({ minimum: 0, exclusiveMinimum: true })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  quantity: number;
}

export class CreateDishDto {
  /** @example Борщ */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  name: string;

  /** @example 1 */
  @IsInt()
  categoryId: number;

  /** @example 3500 */
  @IsInt()
  @Min(0)
  ownPrice: number;

  /** @example 8900 */
  @IsInt()
  @Min(1)
  sellingPrice: number;

  /** @example true */
  @IsBoolean()
  selling: boolean;

  @IsArray()
  @ArrayUnique(
    (ingredient: CreateDishIngredientDto | undefined) =>
      ingredient?.ingredientId,
    { message: 'ingredients must not contain the same ingredient twice' },
  )
  @ValidateNested({ each: true })
  @Type(() => CreateDishIngredientDto)
  ingredients: CreateDishIngredientDto[];
}
