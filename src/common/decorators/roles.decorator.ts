import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Cara pakai: @Roles('owner') atau @Roles('owner', 'staff')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
