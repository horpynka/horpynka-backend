import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  /** @example Напої */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Назва має бути рядком' })
  @IsNotEmpty({ message: 'Назва не може бути порожньою' })
  name: string;
}
