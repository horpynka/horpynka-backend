import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

function emptyToUndefined({ value }: { value: unknown }): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

export class FindOrdersQueryDto {
  /** Page number. Defaults to 1. @example 1 */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  /** Page size. Defaults to 10. @example 10 */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  /** Defaults to CREATED. @example PAID */
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  /** Receipt number or status substring. @example 12 */
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(100)
  search?: string;

  /** Inclusive start date in Europe/Kyiv. @example 2026-10-11 */
  @IsOptional()
  @Transform(emptyToUndefined)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from?: string;

  /** Inclusive end date in Europe/Kyiv. @example 2026-10-17 */
  @IsOptional()
  @Transform(emptyToUndefined)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to?: string;
}
