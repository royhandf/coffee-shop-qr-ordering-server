import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // cek email apa sudah terdaftar
    const exists = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (exists) throw new ConflictException('Email sudah terdaftar');

    // Hash Password
    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        role: 'owner',
      },
    });

    return this.makeToken(user.id, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Email atau password salah');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Email atau password salah');

    return this.makeToken(user.id, user.role);
  }

  private makeToken(userId: string, role: string) {
    return {
      access_token: this.jwt.sign({ sub: userId, role }),
      role,
    };
  }
}
