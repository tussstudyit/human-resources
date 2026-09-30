import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // On Day 8 deployment behind Nginx reverse proxy, enable trust proxy for rate limiting & client IP:
  // (app.getHttpAdapter().getInstance() as any).set('trust proxy', 1);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Ensure CV upload directory exists
  const cvUploadsDir = join(process.cwd(), 'uploads', 'cv');
  if (!existsSync(cvUploadsDir)) {
    mkdirSync(cvUploadsDir, { recursive: true });
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Backend server running on http://localhost:${port}`);
}
await bootstrap();
