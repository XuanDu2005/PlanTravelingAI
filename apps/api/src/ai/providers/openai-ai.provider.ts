import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiChatMessage,
  AiProvider,
  GeneratedItinerary,
  ItineraryActivity,
  ItineraryDay,
  TripItineraryInput,
} from '../ai.types';

/**
 * Placeholder OpenAI provider implementation.
 *
 * The MVP ships with the MockAiProvider so the website can run without any
 * external API key. When you have a working OpenAI key, set:
 *
 *   AI_PROVIDER=openai
 *   AI_API_KEY=sk-...
 *   AI_MODEL=gpt-4o-mini
 *
 * then swap the `useFactory` in `ai.module.ts` to always return `OpenAiProvider`
 * (or implement a smart fallback by API key presence - already done).
 */
@Injectable()
export class OpenAiProvider implements AiProvider {
  private readonly logger = new Logger('OpenAiProvider');

  constructor(private readonly config?: ConfigService) {}

  async chat(messages: AiChatMessage[]): Promise<string> {
    const apiKey = this.config?.get<string>('AI_API_KEY') ?? process.env.AI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OpenAiProvider selected but AI_API_KEY is not configured. ' +
          'Set AI_API_KEY in .env or switch AI_PROVIDER=mock.',
      );
    }

    const model =
      this.config?.get<string>('AI_MODEL') ??
      process.env.AI_MODEL ??
      'gpt-4o-mini';

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`OpenAI chat HTTP ${res.status}: ${text.slice(0, 400)}`);
      throw new Error(`OpenAI chat request failed with status ${res.status}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned no content');
    }
    return content.trim();
  }

  async generateItinerary(
    _input: TripItineraryInput,
  ): Promise<GeneratedItinerary> {
    const apiKey = this.config?.get<string>('AI_API_KEY') ?? process.env.AI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OpenAiProvider selected but AI_API_KEY is not configured. ' +
          'Set AI_API_KEY in .env or switch AI_PROVIDER=mock.',
      );
    }

    this.logger.warn(
      'OpenAiProvider is not fully wired in the MVP. Returning a mocked response.',
    );

    const destSlug = encodeURIComponent(
      _input.destination
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-'),
    );

    const days: ItineraryDay[] = [
      {
        day: 1,
        date: new Date(_input.startDate).toISOString().slice(0, 10),
        theme: 'Kham pha',
        activities: placeholderDay(_input),
      },
    ];
    return {
      title: `Lich trinh ${_input.destination}`,
      summary: `Ke hoach placeholder cho ${_input.destination}.`,
      coverImage: `https://source.unsplash.com/1200x800/?${destSlug}`,
      days,
      tips: [
        'Dat phong khach san truoc 1-2 tuan.',
        'Mang trang phuc phu hop thoi tiet.',
      ],
    };
  }
}

function placeholderDay(input: TripItineraryInput): ItineraryActivity[] {
  const destSlug = encodeURIComponent(
    input.destination
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-'),
  );
  return [
    {
      time: '09:00',
      title: `Chao mung den ${input.destination}`,
      description: `Di dao buoi sang de lam quen voi ${input.destination}.`,
      location: `${input.destination} trung tam`,
      estimatedCost: '150.000 VND',
      transport: 'Di bo',
      imageUrl: `https://source.unsplash.com/800x600/?${destSlug}`,
      category: 'SIGHTSEEING',
    },
    {
      time: '13:00',
      title: 'Diem den noi bat',
      description: 'Cac diem check-in phu hop so thich cua ban.',
      location: 'Trung tam thanh pho',
      estimatedCost: '200.000 VND',
      transport: 'Grab',
      imageUrl: `https://source.unsplash.com/800x600/?${destSlug}`,
      category: 'SIGHTSEEING',
    },
    {
      time: '19:00',
      title: 'Bua toi',
      description: 'Nha hang goi y cho bua toi nay.',
      location: 'Khu am thuc',
      estimatedCost: '300.000 VND',
      transport: 'Grab',
      imageUrl: `https://source.unsplash.com/800x600/?${destSlug}`,
      category: 'FOOD',
    },
  ];
}
