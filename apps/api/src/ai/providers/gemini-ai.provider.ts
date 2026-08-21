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

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta';

interface GeminiContentPart {
  text: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiContentPart[] };
    finishReason?: string;
  }>;
  error?: { code: number; message: string; status: string };
}

@Injectable()
export class GeminiAiProvider implements AiProvider {
  private readonly logger = new Logger('GeminiAiProvider');

  constructor(private readonly config?: ConfigService) {}

  async generateItinerary(input: TripItineraryInput): Promise<GeneratedItinerary> {
    const apiKey =
      this.config?.get<string>('AI_API_KEY') ?? process.env.AI_API_KEY;
    const model =
      this.config?.get<string>('AI_MODEL') ??
      process.env.AI_MODEL ??
      'gemini-2.5-flash';

    if (!apiKey) {
      throw new Error(
        'GeminiAiProvider selected but AI_API_KEY is not configured. ' +
          'Get a free key at https://aistudio.google.com/apikey and set AI_API_KEY in .env.',
      );
    }

    const prompt = this.buildPrompt(input);
    const raw = await this.callGemini(apiKey, model, prompt);
    const parsed = this.extractJson(raw);
    return this.normalize(parsed, input);
  }

  async chat(messages: AiChatMessage[]): Promise<string> {
    const apiKey =
      this.config?.get<string>('AI_API_KEY') ?? process.env.AI_API_KEY;
    const model =
      this.config?.get<string>('AI_MODEL') ??
      process.env.AI_MODEL ??
      'gemini-2.5-flash';

    if (!apiKey) {
      throw new Error(
        'GeminiAiProvider selected but AI_API_KEY is not configured. ' +
          'Get a free key at https://aistudio.google.com/apikey and set AI_API_KEY in .env.',
      );
    }

    const { systemInstruction, contents } = this.toGeminiContents(messages);
    const url = `${GEMINI_ENDPOINT}/models/${encodeURIComponent(model)}:generateContent`;
    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 1024,
      },
    };
    if (systemInstruction) {
      body.systemInstruction = { role: 'system', parts: [{ text: systemInstruction }] };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Gemini chat HTTP ${res.status}: ${text.slice(0, 400)}`);
      throw new Error(`Gemini chat request failed with status ${res.status}`);
    }

    const data = (await res.json()) as GeminiResponse;
    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }
    const parts = data.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      throw new Error('Gemini returned no content');
    }
    return parts.map((p) => p.text ?? '').join('').trim();
  }

  private toGeminiContents(messages: AiChatMessage[]): {
    systemInstruction: string | null;
    contents: Array<{ role: string; parts: GeminiContentPart[] }>;
  } {
    const systemMessages = messages.filter((m) => m.role === 'system');
    const systemInstruction =
      systemMessages.length > 0
        ? systemMessages.map((m) => m.content).join('\n\n')
        : null;

    const contents: Array<{ role: string; parts: GeminiContentPart[] }> = [];
    for (const m of messages) {
      if (m.role === 'system') continue;
      // Gemini uses 'model' instead of 'assistant'.
      const role = m.role === 'assistant' ? 'model' : 'user';
      // Merge consecutive same-role messages (Gemini requires alternating user/model).
      const last = contents[contents.length - 1];
      if (last && last.role === role) {
        last.parts.push({ text: m.content });
      } else {
        contents.push({ role, parts: [{ text: m.content }] });
      }
    }
    return { systemInstruction, contents };
  }

  private buildPrompt(input: TripItineraryInput): string {
    const days = this.diffDays(input.startDate, input.endDate);
    const prefs = input.preferences?.trim() || 'khong co yeu cau cu the';

    return `Ban la chuyen gia lap ke hoach du lich. Hay xay dung lich trinh chi tiet tung ngay bang TIENG VIET, tra ve JSON.

=== THONG TIN CHUYEN DI ===
- Diem den: ${input.destination}
- Ngay bat dau: ${input.startDate}
- Ngay ket thuc: ${input.endDate}
- So ngay: ${days}
- So nguoi: ${input.travelers}
- Ngan sach: ${input.budget}
- So thich/sở thich: ${prefs}

=== YEU CAU NGON NGU ===
- TOAN BO noi dung (title, description, location, summary, tips) phai bang TIENG VIET.
- Giu ten rieng dia danh bang tieng Viet pho bien (vi du: "Ho Guom", "Pho co Hoi An", "Cho noi Cai Rang").

=== OUTPUT JSON (chi tra JSON, KHONG markdown, KHONG giai thich) ===
{
  "title": "Tieu de hap dan cho chuyen di bang tieng Viet",
  "summary": "Tom tat 2-3 cau ve chuyen di, nhip chuyen, diem nhan",
  "coverImage": "URL hinh anh dai dien chuyen di (Unsplash, 1200x800)",
  "days": [
    {
      "day": number,
      "date": string,
      "theme": "Chu de ngan gon cua ngay (tieng Viet)",
      "activities": [
        {
          "time": "HH:MM",
          "title": "Ten hoat dong (tieng Viet)",
          "description": "Mo ta chi tiet 2-3 cau bang tieng Viet",
          "location": "Dia chi/dia diem cu the bang tieng Viet",
          "estimatedCost": "Chi phi uoc tinh cho hoat dong nay (vi du: '200.000 VND/nguoi')",
          "transport": "Cach di chuyen den dia diem (vi du: 'Xe may', 'Grab', 'Di bo')",
          "imageUrl": "URL anh minh hoa dia diem (Unsplash, 800x600)",
          "category": "Mot trong: FOOD | SIGHTSEEING | CULTURE | NATURE | SHOPPING | RELAX | NIGHTLIFE | TRANSPORT"
        }
      ]
    }
  ],
  "tips": [
    "Meo huu ich 1 bang tieng Viet",
    "Meo huu ich 2 bang tieng Viet",
    "Meo huu ich 3 bang tieng Viet"
  ]
}

=== QUY TAC ===
- Tao CHINH XAC ${days} day entries.
- Moi ngay co 4-6 activities (sang, trua, chieu, toi) va phai co theme rieng.
- Dia diem phai thuc te, kha thi, phu hop voi diem den "${input.destination}".
- Moi activity BAT BUOC co: time, title, description, location, estimatedCost, transport, imageUrl, category.
- imageUrl dung dinh dang: https://source.unsplash.com/800x600/?<keyword-tieng-viet-khong-dau>
  Vi du: https://source.unsplash.com/800x600/?ha-long-bay
- estimatedCost phai cu the (so tien + don vi VND/USD).
- Tra ve JSON hop le, KHONG kem markdown, KHONG giai thich them.`;
  }

  private async callGemini(
    apiKey: string,
    model: string,
    prompt: string,
  ): Promise<string> {
    const url = `${GEMINI_ENDPOINT}/models/${encodeURIComponent(model)}:generateContent`;
    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.5,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Gemini HTTP ${res.status}: ${text.slice(0, 400)}`);
      throw new Error(`Gemini request failed with status ${res.status}`);
    }

    const data = (await res.json()) as GeminiResponse;
    if (data.error) {
      this.logger.error(`Gemini API error: ${data.error.message}`);
      throw new Error(`Gemini API error: ${data.error.message}`);
    }

    const parts = data.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      throw new Error('Gemini returned no content');
    }
    return parts.map((p) => p.text ?? '').join('');
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
    throw new Error('Could not extract JSON from Gemini response');
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
            description: 'Tu do tham quan va kham pha thanh pho.',
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
