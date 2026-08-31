import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiChatMessage,
  AiProvider,
  GeneratedItinerary,
  ItineraryActivity,
  ItineraryDay,
  PackingItemSuggestion,
  PackingListInput,
  TripItineraryInput,
} from '../ai.types';
import { buildBasicPackingList } from './basic-packing';

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

  async generatePackingList(input: PackingListInput): Promise<PackingItemSuggestion[]> {
    const system = 'Bạn là trợ lý du lịch. Trả về JSON thuần (không kèm markdown) là một mảng các object {name, category, quantity}. name là tiếng Việt, category thuộc: Giấy tờ, Trang phục, Cá nhân, Sức khoẻ, Điện tử. quantity là số nguyên >= 1.';
    const user = `Hãy gợi ý danh sách đồ cần mang cho chuyến đi: điểm đến "${input.destination}", ${input.daysCount} ngày, ${input.travelers} người. Sở thích/yêu cầu: ${input.preferences || 'không có'}. Tối đa 25 món.`;
    try {
      const content = await this.chat([
        { role: 'system', content: system },
        { role: 'user', content: user },
      ]);
      const parsed = extractJson(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .map((item: any) => ({
            name: String(item?.name ?? '').trim(),
            category: String(item?.category ?? 'Khác').trim(),
            quantity: Math.max(1, Number(item?.quantity) || 1),
          }))
          .filter((item) => item.name.length > 0);
      }
      this.logger.warn(
        `OpenAI packing response was empty or unparseable, using basic checklist fallback.`,
      );
    } catch (err) {
      this.logger.warn(`OpenAI packing generation failed: ${(err as Error).message}`);
    }
    return buildBasicPackingList(input);
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

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : trimmed;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>;
      const candidates = [obj.items, obj.data, obj.packing, obj.result, obj.list];
      for (const c of candidates) {
        if (Array.isArray(c)) return c;
      }
    }
    return [];
  } catch {
    const first = raw.indexOf('[');
    const last = raw.lastIndexOf(']');
    if (first !== -1 && last !== -1 && last > first) {
      try { return JSON.parse(raw.slice(first, last + 1)); } catch { /* ignore */ }
    }
    return [];
  }
}

function fallbackPacking(input: PackingListInput): PackingItemSuggestion[] {
  const days = Math.max(1, input.daysCount);
  return [
    { name: 'CMND/CCCD hoặc Hộ chiếu', category: 'Giấy tờ', quantity: 1 },
    { name: 'Áo thun', category: 'Trang phục', quantity: Math.min(7, days) },
    { name: 'Quần short', category: 'Trang phục', quantity: Math.ceil(days / 2) },
    { name: 'Đồ lót', category: 'Trang phục', quantity: days + 1 },
    { name: 'Kem chống nắng', category: 'Cá nhân', quantity: 1 },
    { name: 'Điện thoại + sạc', category: 'Điện tử', quantity: 1 },
    { name: 'Pin dự phòng', category: 'Điện tử', quantity: 1 },
  ];
}
