import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserPasswordDto {
  /** @example new-password-1 */
  @IsString()
  @MinLength(8, { message: 'Пароль має містити щонайменше 8 символів' })
  @MaxLength(255)
  password: string;
}
