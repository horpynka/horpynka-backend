import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SignInUserDTO {
  /** @example john@example.com */
  @IsEmail()
  @MaxLength(255)
  email: string;

  /** @example password123 */
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password: string;
}
