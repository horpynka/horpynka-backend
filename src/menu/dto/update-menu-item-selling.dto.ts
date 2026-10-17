import { IsBoolean } from 'class-validator';

export class UpdateMenuItemSellingDto {
  /** @example false */
  @IsBoolean()
  selling: boolean;
}
