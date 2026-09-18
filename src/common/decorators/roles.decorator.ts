import { SetMetadata } from '@nestjs/common';
import type { AUTH_ROLES } from '../types/auth';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AUTH_ROLES[]) => SetMetadata(ROLES_KEY, roles);
