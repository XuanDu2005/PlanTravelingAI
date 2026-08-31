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
import { computeBudgetBreakdown, TIER_GUIDANCE } from '../budget';

/**
 * Ollama provider. Connects to a locally running Ollama server
 * (https://ollama.com) over HTTP. No API key required.
 *
 * Expected environment:
 *   AI_PROVIDER=ollama
 *   OLLAMA_BASE_URL=http://host.docker.internal:11434   (default in compose)
 *   OLLAMA_MODEL=phogpt-travel-vietnam                  (or qwen2.5:7b, llama3.1:8b)
 */
@Injectable()
export class OllamaAiProvider implements AiProvider {
  private readonly logger = new Logger('OllamaAiProvider');

  constructor(private readonly config?: ConfigService) {}

  async chat(messages: AiChatMessage[]): Promise<string> {
    const baseUrl =
      this.config?.get<string>('OLLAMA_BASE_URL') ??
      process.env.OLLAMA_BASE_URL ??
      'http://host.docker.internal:11434';
    const model =
      this.config?.get<string>('OLLAMA_MODEL') ??
      process.env.OLLAMA_MODEL ??
      'qwen2.5:7b';

    const url = `${baseUrl.replace(/\/$/, '')}/api/chat`;
    const body = {
      model,
      stream: false,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 1024,
      },
    };

    this.logger.log(`Calling Ollama chat ${model} at ${url}...`);
    const start = Date.now();

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Ollama chat HTTP ${res.status}: ${text.slice(0, 400)}`);
      throw new Error(`Ollama chat request failed with status ${res.status}`);
    }

    const data = (await res.json()) as {
      message?: { content?: string };
      error?: string;
    };
    if (data.error) {
      throw new Error(`Ollama error: ${data.error}`);
    }
    const content = data.message?.content ?? '';
    this.logger.log(`Ollama chat responded in ${Date.now() - start} ms (${content.length} chars)`);
    return content.trim();
  }

  async generateItinerary(input: TripItineraryInput): Promise<GeneratedItinerary> {
    const baseUrl =
      this.config?.get<string>('OLLAMA_BASE_URL') ??
      process.env.OLLAMA_BASE_URL ??
      'http://host.docker.internal:11434';
    const model =
      this.config?.get<string>('OLLAMA_MODEL') ??
      process.env.OLLAMA_MODEL ??
      'qwen2.5:7b';

    const prompt = this.buildPrompt(input);
    const raw = await this.callOllama(baseUrl, model, prompt);
    const parsed = this.extractJson(raw);
    return this.normalize(parsed, input);
  }

  private buildPrompt(input: TripItineraryInput): string {
    const days = this.diffDays(input.startDate, input.endDate);
    const prefs = input.preferences?.trim() || 'khong co';
    const breakdown = computeBudgetBreakdown(input);

    return `Ban la chuyen gia du lich Viet Nam. Tao lich trinh ${days} ngay cho ${input.destination} bang TIENG VIET, tra ve JSON thuan (KHONG markdown).

THONG TIN:
- Den: ${input.destination}
- Nguoi: ${input.travelers} | Budget tong: ${breakdown.totalLabel}
- Moi nguoi/ngay: ${breakdown.perPersonPerDayLabel}
- Phan khuc: ${breakdown.tier.toUpperCase()}
- So thich: ${prefs}

PHAN KHUC ${breakdown.tier.toUpperCase()} (BAT BUOC):
${TIER_GUIDANCE[breakdown.tier]}

RANG BUOC:
- Moi activity ghi estimatedCost theo dinh dang "250000 VND/nguoi" (so nguyen + VND/nguoi, KHONG cham ngan cach).
- Tong chi moi ngay (chia ${input.travelers} nguoi) phai GAN ${breakdown.perPersonPerDayLabel}/nguoi/ngay.
- Moi ngay co 3-4 activities. Mo ta ngan gon 1-2 cau.
- Dia diem thuc te, kha thi voi "${input.destination}".
- Tieng Viet cho moi noi dung. estimatedCost la chi phi CHO 1 NGUOI.

JSON FORMAT:
{"title":"...","summary":"...","coverImage":null,"days":[{"day":1,"date":"YYYY-MM-DD","theme":"...","activities":[{"time":"HH:MM","title":"...","description":"...","location":"...","estimatedCost":"<so> VND/nguoi","transport":"...","category":"FOOD|SIGHTSEEING|CULTURE|NATURE|SHOPPING|RELAX|NIGHTLIFE|TRANSPORT"}]}],"tips":["...","...","..."]}`;
  }

  private async callOllama(
    baseUrl: string,
    model: string,
    prompt: string,
  ): Promise<string> {
    const url = `${baseUrl.replace(/\/$/, '')}/api/generate`;
    const body = {
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.5,
        top_p: 0.9,
        num_predict: 8192,
      },
      format: 'json',
    };

    this.logger.log(`Calling Ollama ${model} at ${url}...`);
    const start = Date.now();

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Ollama HTTP ${res.status}: ${text.slice(0, 400)}`);
      throw new Error(`Ollama request failed with status ${res.status}`);
    }

    const data = (await res.json()) as { response?: string; error?: string };
    if (data.error) {
      throw new Error(`Ollama error: ${data.error}`);
    }
    const response = data.response ?? '';
    this.logger.log(`Ollama responded in ${Date.now() - start} ms (${response.length} chars)`);
    return response;
  }

  private extractJson(raw: string): unknown {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return JSON.parse(trimmed);
    }
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) {
      return JSON.parse(fenced[1].trim());
    }
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }
    throw new Error('Could not extract JSON from Ollama response');
  }

  private normalize(parsed: unknown, input: TripItineraryInput): GeneratedItinerary {
    const obj = (parsed ?? {}) as {
      title?: string;
      summary?: string;
      coverImage?: string;
      days?: Array<{
        day?: number;
        date?: string;
        theme?: string;
        activities?: Array<{
          time?: string;
          title?: string;
          description?: string;
          location?: string;
          estimatedCost?: string;
          transport?: string;
          imageUrl?: string;
          category?: string;
        }>;
      }>;
      tips?: string[];
    };

    const destSlug = encodeURIComponent(
      input.destination
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-'),
    );

    const days: ItineraryDay[] = Array.isArray(obj.days)
      ? obj.days.map((d, idx) => ({
          day: typeof d.day === 'number' ? d.day : idx + 1,
          date:
            typeof d.date === 'string'
              ? d.date
              : this.shiftDate(input.startDate, idx),
          theme: typeof d.theme === 'string' ? d.theme : '',
          activities: Array.isArray(d.activities)
            ? d.activities.map((a): ItineraryActivity => ({
                time: typeof a.time === 'string' ? a.time : '09:00',
                title: typeof a.title === 'string' ? a.title : 'Hoat dong',
                description:
                  typeof a.description === 'string' ? a.description : '',
                location:
                  typeof a.location === 'string' ? a.location : input.destination,
                estimatedCost:
                  typeof a.estimatedCost === 'string' ? a.estimatedCost : '',
                transport: typeof a.transport === 'string' ? a.transport : '',
                imageUrl:
                  typeof a.imageUrl === 'string' && a.imageUrl
                    ? a.imageUrl
                    : `https://source.unsplash.com/800x600/?${destSlug}`,
                category: typeof a.category === 'string' ? a.category : 'SIGHTSEEING',
              }))
            : [],
        }))
      : [];

    if (days.length === 0) {
      days.push({
        day: 1,
        date: input.startDate,
        theme: 'Kham pha',
        activities: [
          {
            time: '09:00',
            title: `Kham pha ${input.destination}`,
            description: 'Tu do tham quan thanh pho.',
            location: input.destination,
            estimatedCost: '200.000 VND',
            transport: 'Di bo',
            imageUrl: `https://source.unsplash.com/800x600/?${destSlug}`,
            category: 'SIGHTSEEING',
          },
        ],
      });
    }

    return {
      title:
        typeof obj.title === 'string'
          ? obj.title
          : `Lich trinh ${input.destination}`,
      summary:
        typeof obj.summary === 'string'
          ? obj.summary
          : `Ke hoach du lich ${input.destination}.`,
      coverImage:
        typeof obj.coverImage === 'string' && obj.coverImage
          ? obj.coverImage
          : `https://source.unsplash.com/1200x800/?${destSlug}`,
      days,
      tips: Array.isArray(obj.tips)
        ? obj.tips.filter((t): t is string => typeof t === 'string')
        : [],
    };
  }

  private diffDays(start: string, end: string): number {
    const s = Date.parse(start);
    const e = Date.parse(end);
    if (Number.isNaN(s) || Number.isNaN(e)) return 1;
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  }

  private shiftDate(start: string, offsetDays: number): string {
    const s = Date.parse(start);
    if (Number.isNaN(s)) return start;
    return new Date(s + offsetDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
  }

  async generatePackingList(input: PackingListInput): Promise<PackingItemSuggestion[]> {
    const system = 'Bạn là trợ lý du lịch. Trả về JSON thuần là một mảng các object {name, category, quantity}. name tiếng Việt, category thuộc: Giấy tờ, Trang phục, Cá nhân, Sức khoẻ, Điện tử. quantity là số nguyên >= 1.';
    const user = `Gợi ý đồ cần mang cho chuyến đi: điểm đến "${input.destination}", ${input.daysCount} ngày, ${input.travelers} người. Sở thích: ${input.preferences || 'không có'}. Tối đa 25 món.`;
    try {
      const content = await this.chat([
        { role: 'system', content: system },
        { role: 'user', content: user },
      ]);
      const parsed = extractPacking(content);
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
        `Ollama packing response was empty or unparseable, using basic checklist fallback.`,
      );
    } catch (err) {
      this.logger.warn(`Ollama packing generation failed: ${(err as Error).message}`);
    }
    return buildBasicPackingList(input);
  }
}

function extractPacking(text: string): unknown {
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
