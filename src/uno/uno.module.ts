import { Module } from '@nestjs/common';
import { UnoGateway } from './uno.gateway';
import { UnoService } from './uno.service';
import { PrismaService } from '../prisma/prisma.service'; 

@Module({
  providers: [UnoGateway, UnoService, PrismaService],
})
export class UnoModule {}