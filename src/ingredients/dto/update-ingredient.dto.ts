import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IngredientMeasurementUnit } from './create-ingredient.dto';

export class UpdateIngredientDto {
  /** @example Борошно */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Назва має бути рядком' })
  @IsNotEmpty({ message: 'Назва не може бути порожньою' })
  name: string;

  /** @example g */
  @IsEnum(IngredientMeasurementUnit, {
    message: 'Одиниця виміру має бути однією з: g, ml, pcs',
  })
  measurementUnit: IngredientMeasurementUnit;
}
