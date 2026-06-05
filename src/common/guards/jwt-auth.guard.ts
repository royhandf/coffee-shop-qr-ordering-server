import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Cara pakai di controller: @UseGuards(JwtAuthGuard)
// Fungsi: memastikan req punya JWT token valid

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
