import type { JwtUser } from '../types/auth.types';

export function resolveBranchFilter(
  user: JwtUser | undefined,
  requestedBranchId?: string,
): string | undefined {
  if (!user?.roleName) return requestedBranchId;
  if (user.roleName === 'admin') return requestedBranchId;
  if (user.roleName === 'manager' && user.branchId) return user.branchId;
  return requestedBranchId;
}
