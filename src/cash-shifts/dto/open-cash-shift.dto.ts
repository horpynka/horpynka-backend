import { IsInt, Min } from 'class-validator';

export class OpenCashShiftDto {
  /** @example 50000 */
  @IsInt()
  @Min(0)
  openingBalance: number;
}
