import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AuthModule } from '../auth/auth.module';
import { GeminiAiProvider } from './providers/gemini-ai.provider';
import { MockAiProvider } from './providers/mock-ai.provider';
import { OpenAiProvider } from './providers/openai-ai.provider';
import { OllamaAiProvider } from './providers/ollama-ai.provider';
import { AI_PROVIDER } from './ai.tokens';

const aiProvider: Provider = {
  provide: AI_PROVIDER,
  inject: [
    ConfigService,
    MockAiProvider,
    GeminiAiProvider,
    OpenAiProvider,
    OllamaAiProvider,
  ],
  useFactory: (
    config: ConfigService,
    mock: MockAiProvider,
    gemini: GeminiAiProvider,
    openAi: OpenAiProvider,
    ollama: OllamaAiProvider,
  ) => {
    const provider = (config.get<string>('AI_PROVIDER') ?? 'mock').toLowerCase();
    const apiKey =
      config.get<string>('AI_API_KEY') ?? process.env.AI_API_KEY;

    // Ưu tiên ollama nếu được chọn (không cần key)
    if (provider === 'ollama') {
      return ollama;
    }

    if (provider === 'openai') {
      if (!apiKey) {
        // eslint-disable-next-line no-console
        console.warn(
          '[AiModule] AI_PROVIDER=openai but AI_API_KEY is empty. Falling back to mock provider.',
        );
        return mock;
      }
      return openAi;
    }

    if (provider === 'gemini') {
      if (!apiKey) {
        // eslint-disable-next-line no-console
        console.warn(
          '[AiModule] AI_PROVIDER=gemini but AI_API_KEY is empty. Falling back to mock provider.',
        );
        return mock;
      }
      return gemini;
    }

    if (provider === 'mock') {
      return mock;
    }

    // eslint-disable-next-line no-console
    console.warn(
      `[AiModule] Unknown AI_PROVIDER="${provider}". Falling back to mock provider.`,
    );
    return mock;
  },
};

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [AiController],
  providers: [
    AiService,
    MockAiProvider,
    GeminiAiProvider,
    OpenAiProvider,
    OllamaAiProvider,
    aiProvider,
  ],
  exports: [AiService],
})
export class AiModule {}
