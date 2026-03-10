import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UnoCard {
  color: string;
  value: string;
}

@Injectable()
export class UnoService {
  constructor(private prisma: PrismaService) {}

  private createDeck(): UnoCard[] {
    const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
    const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'SKIP', 'REVERSE', 'DRAW2'];
    
    let deck: UnoCard[] = [];

    for (const color of colors) {
      for (const value of values) {
        deck.push({ color, value });
        if (value !== '0') deck.push({ color, value }); 
      }
    }
    for (let i = 0; i < 4; i++) {
      deck.push({ color: 'WILD', value: 'WILD' });
      deck.push({ color: 'WILD', value: 'DRAW4' });
    }
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  async startGame(gameId: string) {
    const deck = this.createDeck();

    const players = await this.prisma.unoPlayer.findMany({
      where: { gameId },
      orderBy: { position: 'asc' }
    });

    if (players.length < 2) throw new BadRequestException('Not enough players to start');

    for (const player of players) {
      const hand = deck.splice(0, 7);
      await this.prisma.unoPlayer.update({
        where: { id: player.id },
        data: { hand: hand as any },
      });
    }

    let topCard = deck.pop();

    while (topCard?.color === 'WILD') {
      deck.unshift(topCard); 
      topCard = deck.pop();
    }

    return this.prisma.unoGame.update({
      where: { id: gameId },
      data: {
        status: 'PLAYING',
        deck: deck as any,
        topCard: topCard as any,
        currentTurn: players[0].userId, 
      },
      include: { players: true } 
    });
  }

  async drawCard(gameId: string, userId: string) {
    const game = await this.prisma.unoGame.findUnique({ where: { id: gameId } });
    const player = await this.prisma.unoPlayer.findUnique({ 
      where: { gameId_userId: { gameId, userId } } 
    });

    if (game?.currentTurn !== userId) throw new BadRequestException("It is not your turn!");

    const deck = (game?.deck as unknown) as UnoCard[];
    const drawnCard = deck.pop();
    const hand = (player?.hand as unknown) as UnoCard[];
    
    if (drawnCard) {
      hand.push(drawnCard);
    }

    await this.prisma.unoPlayer.update({
      where: { id: player!.id },
      data: { hand: hand as any } 
    });

    const nextPlayer = await this.getNextPlayer(gameId, userId, game!.direction);

    return this.prisma.unoGame.update({
      where: { id: gameId },
      data: { 
        deck: deck as any,
        currentTurn: nextPlayer.userId
      }
    });
  }

  private async getNextPlayer(gameId: string, currentUserId: string, direction: number) {
    const players = await this.prisma.unoPlayer.findMany({
      where: { gameId },
      orderBy: { position: 'asc' }
    });
    const currentIndex = players.findIndex(p => p.userId === currentUserId);

    let nextIndex = (currentIndex + direction) % players.length;
    if (nextIndex < 0) nextIndex = players.length - 1;
    
    return players[nextIndex];
  }
}