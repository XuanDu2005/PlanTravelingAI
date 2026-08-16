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

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
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