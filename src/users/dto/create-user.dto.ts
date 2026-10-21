import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AUTH_ROLES } from 'src/common/types/auth';

export class CreateUserDto {
  /** @example cashier@horpynka.local */
  @IsEmail({}, { message: 'Некоректний імейл' })
  @MaxLength(255)
  email: string;

  /** @example password123 */
  @IsString()
  @MinLength(8, { message: 'Пароль має містити щонайменше 8 символів' })
  @MaxLength(255)
  password: string;

  /** @example ["HORPYNKA_CASHIER_USER"] */
  @IsArray()
  @ArrayMinSize(1, { message: 'Потрібна щонайменше одна роль' })
  @ArrayUnique({ message: 'Ролі не можуть повторюватися' })
  @IsEnum(AUTH_ROLES, { each: true, message: 'Невідома роль' })
  roles: AUTH_ROLES[];
}
