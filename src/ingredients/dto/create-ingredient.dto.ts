import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum IngredientMeasurementUnit {
  G = 'g',
  ML = 'ml',
  PCS = 'pcs',
}

export class CreateIngredientDto {
  /** @example Борошно */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  name: string;

  /** @example g */
  @IsEnum(IngredientMeasurementUnit)
  measurementUnit: IngredientMeasurementUnit;
}
