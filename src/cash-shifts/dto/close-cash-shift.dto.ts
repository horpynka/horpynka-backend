import { IsInt, Min } from 'class-validator';

export class CloseCashShiftDto {
  /**
   * Cash counted in the drawer when closing the shift, in kopecks.
   * @example 162000
   */
  @IsInt()
  @Min(0)
  actualClosingBalance: number;
}
