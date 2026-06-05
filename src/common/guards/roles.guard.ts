import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Cara pakai di controller: @Roles('owner') atau @Roles('owner', 'staff')
// Fungsi: memastikan user punya role yang diizinkan

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!req) return true;

    const { user } = context.switchToHttp().getRequest();
    return req.includes(user.role);
  }
}
