import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  /** @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 */
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
