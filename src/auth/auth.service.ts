import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(data: any) { 
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username }
        ]
      }
    });

    if (existingUser) {
      throw new BadRequestException('Username or Email already taken');
    }

    const user = await this.prisma.user.create({ 
      data: {
        name: data.name,
        email: data.email,
        username: data.username,
        password: data.password
      }
    });

    // 1. Strip the password before returning
    const { password, ...result } = user; 
    return result;
  }

  async login(identifier: string, password: any) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Strip the password before returning
    const { password: userPassword, ...result } = user; 
    return result;
  }
}