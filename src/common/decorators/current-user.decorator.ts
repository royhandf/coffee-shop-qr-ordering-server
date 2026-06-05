import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// cara pakai di controller: @CurrentUser() user:any
// Fungsi: mengambil data user yang login dari JWT

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user;
  },
);
