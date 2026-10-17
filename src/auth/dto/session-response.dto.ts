import type { AUTH_ROLES } from 'src/common/types/auth';

export class SessionResponseDto {
  /** @example john@example.com */
  email: string;

  /** @example ["HORPYNKA_PANEL_ADMIN"] */
  roles: AUTH_ROLES[];
}
