import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // THIS LINE IS CRITICAL
  app.enableCors({
    origin: 'https://pixelstack-arcade.vercel.app', // Your Vercel frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT || 10000);
}
bootstrap();