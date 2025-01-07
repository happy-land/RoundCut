import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // bodyParser: false,
    cors: true,
  });

  app.use((req, _, next) => {
    console.log(`Got invoked: ${req.originalUrl}`);
    next();
  });

  app.use(json({ limit: '50mb' }));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(3000);
}
bootstrap();
