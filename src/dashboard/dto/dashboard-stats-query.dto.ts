import { IsOptional, Matches } from 'class-validator';

export class DashboardStatsQueryDto {
  /** Inclusive start date in Europe/Kyiv. @example 2026-10-11 */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from?: string;

  /** Inclusive end date in Europe/Kyiv. @example 2026-10-17 */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to?: string;
}
