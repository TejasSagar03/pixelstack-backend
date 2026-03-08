import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Post('score')
  async submitScore(
    @Body() data: { userId: string; gameType: string; value: number }
  ) {
    // This will now find the method in your service
    return this.gamesService.saveScore(data.userId, data.gameType, data.value);
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('game') gameType: string) {
    return this.gamesService.getLeaderboard(gameType);
  }
}