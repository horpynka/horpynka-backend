import { ArrayMinSize, ArrayUnique, IsArray, IsEnum } from 'class-validator';
import { AUTH_ROLES } from 'src/common/types/auth';

export class UpdateUserRolesDto {
  /** @example ["HORPYNKA_PANEL_ADMIN","HORPYNKA_CASHIER_USER"] */
  @IsArray()
  @ArrayMinSize(1, { message: 'Потрібна щонайменше одна роль' })
  @ArrayUnique({ message: 'Ролі не можуть повторюватися' })
  @IsEnum(AUTH_ROLES, { each: true, message: 'Невідома роль' })
  roles: AUTH_ROLES[];
}
