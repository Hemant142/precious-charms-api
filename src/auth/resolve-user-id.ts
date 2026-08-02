import { ForbiddenException } from '@nestjs/common';

type AuthUser = { userId: string; role?: string };

/** Admins may pass ?userId= to inspect another user's resources. */
export function resolveTargetUserId(
  current: AuthUser,
  queryUserId?: string,
): string {
  if (!queryUserId || queryUserId === current.userId) {
    return current.userId;
  }
  if (current.role !== 'admin') {
    throw new ForbiddenException('Admin access required');
  }
  return queryUserId;
}
