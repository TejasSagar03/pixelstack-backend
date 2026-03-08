import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { GamesModule } from './games/games.module';
import { AuthModule } from './auth/auth.module'; // <-- Add this import

@Global() 
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GamesModule,
    AuthModule 
  ],
  providers: [PrismaService],
  exports: [PrismaService], 
})
export class AppModule {}