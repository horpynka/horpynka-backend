export enum AUTH_ROLES {
  HORPYNKA_PANEL_ADMIN = 'HORPYNKA_PANEL_ADMIN',
  HORPYNKA_CASHIER_USER = 'HORPYNKA_CASHIER_USER',
}

export function isAuthRole(role: string): role is AUTH_ROLES {
  return (Object.values(AUTH_ROLES) as string[]).includes(role);
}
