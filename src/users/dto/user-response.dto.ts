import type { AUTH_ROLES } from 'src/common/types/auth';

export class UserResponseDto {
  /** @example 1 */
  id: number;

  /** @example cashier@horpynka.local */
  email: string;

  /** @example ["HORPYNKA_CASHIER_USER"] */
  roles: AUTH_ROLES[];
}
