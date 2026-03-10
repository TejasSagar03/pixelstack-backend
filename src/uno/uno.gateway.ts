import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UnoService } from './uno.service';

@WebSocketGateway({
  cors: {
    origin: ['https://pixelstack-arcade.vercel.app', 'http://localhost:4200'],
    credentials: true,
  },
})
export class UnoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly unoService: UnoService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { gameId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.gameId);
    console.log(`User ${data.userId} joined room ${data.gameId}`);
    
    this.server.to(data.gameId).emit('playerJoined', { userId: data.userId });
  }

  @SubscribeMessage('startGame')
  async handleStartGame(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const gameState = await this.unoService.startGame(data.gameId);
      
      // Broadcast the fresh game state (top card, whose turn it is) to the whole room!
      this.server.to(data.gameId).emit('gameStarted', {
        topCard: gameState.topCard,
        currentTurn: gameState.currentTurn,
        status: gameState.status
      });
    } catch (error) {
      client.emit('gameError', { message: error.message });
    }
  }

  @SubscribeMessage('drawCard')
  async handleDrawCard(
    @MessageBody() data: { gameId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const updatedGame = await this.unoService.drawCard(data.gameId, data.userId);
      
      this.server.to(data.gameId).emit('turnAdvanced', {
        currentTurn: updatedGame.currentTurn
      });
      
    } catch (error) {
      client.emit('gameError', { message: error.message });
    }
  }
}