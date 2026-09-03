import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  // Use NestExpressApplication so we can pass body-parser options at the
  // platform level (default is 100kb, which trips on base64 avatar uploads).
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: false,
    bodyParser: false,
  });

  const config = app.get(ConfigService);
  const port = Number(config.get<string>('PORT') ?? 3000);

  app.setGlobalPrefix('api');

  // Re-enable JSON/urlencoded parsers with a larger limit so avatar uploads
  // (~1.4MB base64 of a 1MB image) succeed.
  app.useBodyParser('json', { limit: '2mb' });
  app.useBodyParser('urlencoded', { limit: '2mb', extended: true });

  const corsOrigins = (config.get<string>('CORS_ORIGINS') ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  // Build a permissive CORS layer:
  // - use explicit list from env when provided
  // - otherwise allow any *.vercel.app preview + localhost (dev)
  const vercelOriginRegex = /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.vercel\.app$/i;
  const isOriginAllowed = (origin: string | undefined): boolean => {
    if (!origin) return true; // mobile/curl
    if (origin.startsWith('http://localhost')) return true;
    if (corsOrigins.length > 0) return corsOrigins.includes(origin);
    return vercelOriginRegex.test(origin);
  };

  app.enableCors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(port);
  Logger.log(`TravelMind API listening on http://localhost:${port}/api`, 'Bootstrap');
}

bootstrap();