import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AuthModule } from '../auth/auth.module';
import { GeminiAiProvider } from './providers/gemini-ai.provider';
import { AI_PROVIDER } from './ai.tokens';

/**
 * AI module — chỉ sử dụng Google Gemini API.
 * Nếu thiếu AI_API_KEY hoặc Gemini gặp lỗi lúc generate itinerary,
 * Gemini provider sẽ tự fallback sang `MockAiProvider` nội bộ
 * (không cần provider abstraction ở đây nữa).
 */
@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [AiController],
  providers: [AiService, GeminiAiProvider, { provide: AI_PROVIDER, useExisting: GeminiAiProvider }],
  exports: [AiService],
})
export class AiModule {}
