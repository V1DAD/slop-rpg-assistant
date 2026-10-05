import { User } from './repository';

export type Role = 'GM' | 'PLAYER';

export function hasRole(user: User | undefined, role: Role): boolean {
  if (!user) return false;
  return user.role === role;
}
