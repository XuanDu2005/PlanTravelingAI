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
    const prefs = input.preferences?.trim() || 'khong co yeu cau cu the';

    return `Ban la chuyen gia lap ke hoach du lich Viet Nam. Hay xay dung lich trinh chi tiet bang TIENG VIET, tra ve JSON.

=== THONG TIN CHUYEN DI ===
- Diem den: ${input.destination}
- Ngay bat dau: ${input.startDate}
- Ngay ket thuc: ${input.endDate}
- So ngay: ${days}
- So nguoi: ${input.travelers}
- Ngan sach: ${input.budget}
- So thich: ${prefs}

=== YEU CAU ===
- TOAN BO noi dung TIENG VIET.
- Tra ve CHINH XAC JSON khong kem markdown.

=== FORMAT ===
{
  "title": "Tieu de bang tieng Viet",
  "summary": "Tom tat 2-3 cau bang tieng Viet",
  "coverImage": "URL hinh anh dai dien (Unsplash 1200x800)",
  "days": [
    {
      "day": number,
      "date": "YYYY-MM-DD",
      "theme": "Chu de ngan gon (tieng Viet)",
      "activities": [
        {
          "time": "HH:MM",
          "title": "Ten hoat dong",
          "description": "Mo ta chi tiet 2-3 cau",
          "location": "Dia diem cu the",
          "estimatedCost": "Chi phi VND",
          "transport": "Cach di chuyen",
          "imageUrl": "URL anh Unsplash 800x600",
          "category": "FOOD|SIGHTSEEING|CULTURE|NATURE|SHOPPING|RELAX|NIGHTLIFE|TRANSPORT"
        }
      ]
    }
  ],
  "tips": ["Meo 1 tieng Viet", "Meo 2 tieng Viet", "Meo 3 tieng Viet"]
}

=== QUY TAC ===
- Tao CHINH XAC ${days} ngay.
- Moi ngay 4-6 hoat dong (sang, trua, chieu, toi).
- Dia diem THUC TE, kha thi voi "${input.destination}".
- imageUrl: https://source.unsplash.com/800x600/?<keyword-khong-dau>
- estimatedCost cu the (so tien VND).
- JSON hop le, KHONG markdown.`;
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
        num_predict: 4096,
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
}
