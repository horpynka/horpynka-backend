import { compare, hash } from 'bcrypt';

export function hashPassword(
  password: string,
  saltRounds: number,
): Promise<string> {
  return hash(password, saltRounds);
}

export function comparePasswords(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return compare(password, hashedPassword);
}
