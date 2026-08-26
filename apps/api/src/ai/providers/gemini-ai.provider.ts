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
import { MockAiProvider } from './mock-ai.provider';

class TruncatedResponseError extends Error {
  constructor(message: string, public partial: string) {
    super(message);
    this.name = 'TruncatedResponseError';
  }
}

class EmptyResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmptyResponseError';
  }
}

/**
 * Attempt to repair JSON that was truncated mid-stream (Gemini MAX_TOKENS,
 * network drop, etc.). Strategy:
 *   1. Find the last complete top-level structure by walking backwards from
 *      the end, closing open strings and tracking brace/bracket depth.
 *   2. Close any still-open brackets/braces.
 *   3. Strip trailing commas.
 */
function repairTruncatedJson(input: string): string {
  let text = input;
  // Remove any trailing comma before we start counting
  text = text.replace(/,\s*$/, '');

  // Walk through and track depth of braces/brackets and string state.
  let braceDepth = 0;
  let bracketDepth = 0;
  let inString = false;
  let escape = false;
  let lastSafeIndex = -1;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (ch === '\\') {
        escape = true;
      } else if (ch === '"') {
        inString = false;
        lastSafeIndex = i;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === '{') {
      braceDepth += 1;
      lastSafeIndex = i;
    } else if (ch === '}') {
      braceDepth = Math.max(0, braceDepth - 1);
      lastSafeIndex = i;
    } else if (ch === '[') {
      bracketDepth += 1;
      lastSafeIndex = i;
    } else if (ch === ']') {
      bracketDepth = Math.max(0, bracketDepth - 1);
      lastSafeIndex = i;
    }
  }

  // If we ended mid-string, close it before appending closers
  if (inString) {
    text += '"';
  }

  // Cut off anything past the last fully-closed brace/bracket (in case Gemini
  // emitted a half-baked key/value after our last "safe" position)
  if (lastSafeIndex >= 0 && lastSafeIndex < text.length - 1) {
    text = text.slice(0, lastSafeIndex + 1);
  }

  // Close any remaining open structures
  text += ']'.repeat(bracketDepth);
  text += '}'.repeat(braceDepth);

  // Strip stray trailing commas that may have appeared at the cut boundary
  text = text.replace(/,(\s*[\]}])/g, '$1');

  return text;
}

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
    const maxAttempts = 2;
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const raw = await this.callGemini(apiKey, model, prompt);
        const parsed = this.extractJson(raw);
        return this.normalize(parsed, input);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.logger.warn(
          `Gemini attempt ${attempt}/${maxAttempts} failed: ${lastError.message}`,
        );
        const msg = lastError.message.toLowerCase();
        // Don't retry on permanent failures (auth, quota, invalid model)
        if (
          msg.includes('api_key') ||
          msg.includes('quota') ||
          msg.includes('permission') ||
          msg.includes('status 4')
        ) {
          break;
        }
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }

    // Gemini repeatedly failed (truncated JSON, empty response, network blip...).
    // Fall back to MockAiProvider so the user always gets a usable itinerary
    // instead of a 500.
    this.logger.error(
      `Gemini failed after ${maxAttempts} attempts, falling back to MockAiProvider: ${lastError?.message}`,
    );
    const mock = new MockAiProvider();
    return mock.generateItinerary(input);
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
- Moi ngay co 3-4 activities (it hon neu dien bien don gian). Mo ta ngan gon 1-2 cau.
- Dia diem thuc te, kha thi voi "${input.destination}".
- Tieng Viet cho moi noi dung. estimatedCost la chi phi CHO 1 NGUOI.

JSON FORMAT (tra ve dung, khong them giai thich):
{"title":"...","summary":"...","coverImage":null,"days":[{"day":1,"date":"YYYY-MM-DD","theme":"...","activities":[{"time":"HH:MM","title":"...","description":"...","location":"...","estimatedCost":"<so> VND/nguoi","transport":"...","category":"FOOD|SIGHTSEEING|CULTURE|NATURE|SHOPPING|RELAX|NIGHTLIFE|TRANSPORT"}]}],"tips":["...","...","..."]}`;
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
        // 16384 lets a 5-day itinerary with 6 activities each fit comfortably.
        maxOutputTokens: 16384,
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

    const candidate = data.candidates?.[0];
    if (!candidate) {
      throw new Error('Gemini returned no candidates');
    }

    // Surface MAX_TOKENS truncation so the caller can decide what to do.
    const finishReason = candidate.finishReason;
    const parts = candidate.content?.parts;
    const text = parts?.map((p) => p.text ?? '').join('') ?? '';

    if (finishReason === 'MAX_TOKENS' || finishReason === 'LENGTH') {
      throw new TruncatedResponseError(
        `Gemini response truncated (finishReason=${finishReason}, length=${text.length})`,
        text,
      );
    }
    if (!text) {
      throw new EmptyResponseError(
        `Gemini returned empty content (finishReason=${finishReason ?? 'unknown'})`,
      );
    }
    return text;
  }

  private extractJson(raw: string): unknown {
    const trimmed = raw.trim();
    if (!trimmed) {
      throw new EmptyResponseError('Empty response from Gemini');
    }

    // 1) Try as-is first (fastest path, no truncation)
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return JSON.parse(trimmed);
      } catch {
        // Fall through to repair
      }
    } else {
      // 2) Strip ```json fences
      const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenced) {
        const candidate = fenced[1].trim();
        try {
          return JSON.parse(candidate);
        } catch {
          try {
            return JSON.parse(repairTruncatedJson(candidate));
          } catch {
            throw new TruncatedResponseError(
              'Gemini returned JSON inside fences that could not be repaired',
              candidate,
            );
          }
        }
      }
    }

    // 3) Locate the first { ... last } substring, then try parse → repair → parse
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace === -1) {
      throw new Error('Gemini response contained no JSON object');
    }
    const slice =
      lastBrace !== -1 && lastBrace > firstBrace
        ? trimmed.slice(firstBrace, lastBrace + 1)
        : trimmed.slice(firstBrace);
    try {
      return JSON.parse(slice);
    } catch {
      try {
        return JSON.parse(repairTruncatedJson(slice));
      } catch {
        throw new TruncatedResponseError(
          'Gemini returned malformed JSON that could not be repaired',
          slice,
        );
      }
    }
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
        `Gemini packing response was empty or unparseable, using basic checklist fallback.`,
      );
    } catch (err) {
      this.logger.warn(`Gemini packing generation failed: ${(err as Error).message}`);
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
    // Gemini sometimes wraps the array in an object like { items: [...] }
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
