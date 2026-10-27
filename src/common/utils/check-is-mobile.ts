export function checkIsMobile(clientType?: string | string[]): boolean {
  const value = Array.isArray(clientType) ? clientType[0] : clientType;
  return value === 'mobile';
}
