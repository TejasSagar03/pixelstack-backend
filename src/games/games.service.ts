import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  // This is the method the controller was looking for
  async saveScore(userId: string, gameType: string, value: number) {
    return this.prisma.score.create({
      data: {
        gameType: gameType,
        value: value,
        userId: userId,
      },
    });
  }

  async getLeaderboard(gameType: string) {
    return this.prisma.score.findMany({
      where: { gameType },
      take: 10,
      orderBy: { value: 'desc' },
      include: {
        user: { select: { username: true } },
      },
    });
  }
}