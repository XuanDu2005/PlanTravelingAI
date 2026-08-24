import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type {
  WeatherDayAdvice,
  WeatherDayForecast,
  WeatherForecastResponse,
  WeatherResolvedLocation,
} from './dto/weather-response.dto';

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoGeoResult {
  results?: Array<{
    name: string;
    country?: string;
    country_code?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  }>;
}

interface OpenMeteoDailyResponse {
  timezone?: string;
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    weathercode: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    wind_speed_10m_max: number[];
  };
  error?: boolean;
  reason?: string;
}

/**
 * Map WMO weather codes to a Vietnamese label + emoji.
 * Reference: https://open-meteo.com/en/docs (Weather variable documentation)
 */
const WMO_MAP: Record<number, { label: string; emoji: string }> = {
  0: { label: 'Trời quang', emoji: '☀️' },
  1: { label: 'Ít mây', emoji: '🌤️' },
  2: { label: 'Có mây', emoji: '⛅' },
  3: { label: 'U ám', emoji: '☁️' },
  45: { label: 'Sương mù', emoji: '🌫️' },
  48: { label: 'Sương muối', emoji: '🌫️' },
  51: { label: 'Mưa phùn nhẹ', emoji: '🌦️' },
  53: { label: 'Mưa phùn', emoji: '🌦️' },
  55: { label: 'Mưa phùn dày', emoji: '🌦️' },
  56: { label: 'Mưa phùn đóng băng', emoji: '🌧️' },
  57: { label: 'Mưa phùn đóng băng dày', emoji: '🌧️' },
  61: { label: 'Mưa nhẹ', emoji: '🌧️' },
  63: { label: 'Mưa vừa', emoji: '🌧️' },
  65: { label: 'Mưa to', emoji: '🌧️' },
  66: { label: 'Mưa đóng băng', emoji: '🌧️' },
  67: { label: 'Mưa đóng băng to', emoji: '🌧️' },
  71: { label: 'Tuyết nhẹ', emoji: '🌨️' },
  73: { label: 'Tuyết vừa', emoji: '🌨️' },
  75: { label: 'Tuyết to', emoji: '❄️' },
  77: { label: 'Tuyết hạt', emoji: '🌨️' },
  80: { label: 'Mưa rào nhẹ', emoji: '🌦️' },
  81: { label: 'Mưa rào', emoji: '🌧️' },
  82: { label: 'Mưa rào to', emoji: '⛈️' },
  85: { label: 'Mưa tuyết nhẹ', emoji: '🌨️' },
  86: { label: 'Mưa tuyết to', emoji: '❄️' },
  95: { label: 'Dông', emoji: '⛈️' },
  96: { label: 'Dông kèm mưa đá nhẹ', emoji: '⛈️' },
  99: { label: 'Dông kèm mưa đá to', emoji: '⛈️' },
};

interface ItineraryDayHint {
  day: number;
  date: string;
  theme: string;
}

interface ForecastCacheEntry {
  expiresAt: number;
  data: WeatherForecastResponse;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const MAX_RANGE_DAYS = 16; // Open-Meteo free tier caps at ~16
const FORECAST_TIMEOUT_MS = 8000;

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly cache = new Map<string, ForecastCacheEntry>();

  async getForecast(
    destination: string,
    startDate: string,
    endDate: string,
    itineraryDays?: ItineraryDayHint[],
  ): Promise<WeatherForecastResponse> {
    const { start, end } = this.normalizeDates(startDate, endDate);
    const cacheKey = `${destination.trim().toLowerCase()}|${start}|${end}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return this.attachItinerary(cached.data, itineraryDays);
    }

    const location = await this.geocode(destination);
    const raw = await this.fetchDailyForecast(location, start, end);
    const days = this.normalizeForecast(raw, start, end);

    const response: WeatherForecastResponse = {
      destination,
      resolvedLocation: location,
      units: {
        temperature: '°C',
        precipitation: 'mm',
        windSpeed: 'km/h',
        uvIndex: 'index',
      },
      fetchedAt: new Date().toISOString(),
      days,
    };

    this.cache.set(cacheKey, { data: response, expiresAt: Date.now() + CACHE_TTL_MS });
    return this.attachItinerary(response, itineraryDays);
  }

  private attachItinerary(
    response: WeatherForecastResponse,
    itineraryDays?: ItineraryDayHint[],
  ): WeatherForecastResponse {
    if (!itineraryDays || itineraryDays.length === 0) return response;
    const byDate = new Map(response.days.map((d) => [d.date, d]));
    response.itineraryAlignment = itineraryDays
      .map((it) => {
        const forecast = byDate.get(it.date);
        if (!forecast) return null;
        return { day: it.day, date: it.date, theme: it.theme, forecast };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    return response;
  }

  private normalizeDates(startIso: string, endIso: string): { start: string; end: string } {
    const startDate = new Date(`${startIso.slice(0, 10)}T00:00:00Z`);
    const endDate = new Date(`${endIso.slice(0, 10)}T00:00:00Z`);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid startDate or endDate');
    }
    if (endDate < startDate) {
      throw new BadRequestException('endDate must be on or after startDate');
    }
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const clampedStart = startDate < today ? today : startDate;
    const diffDays =
      Math.round((endDate.getTime() - clampedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays > MAX_RANGE_DAYS) {
      throw new BadRequestException(
        `Date range too large (max ${MAX_RANGE_DAYS} days from today)`,
      );
    }
    return {
      start: clampedStart.toISOString().slice(0, 10),
      end: endDate.toISOString().slice(0, 10),
    };
  }

  private async geocode(query: string): Promise<WeatherResolvedLocation> {
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=5&language=vi&format=json`;
    let data: OpenMeteoGeoResult;
    try {
      data = (await this.fetchJson(url)) as OpenMeteoGeoResult;
    } catch (err) {
      this.logger.warn(`Geocoding failed for "${query}": ${(err as Error).message}`);
      throw new ServiceUnavailableException(
        'Không thể tra cứu địa điểm. Vui lòng thử lại.',
      );
    }

    const results = data?.results ?? [];
    // Prefer a result inside Vietnam if present, otherwise take the first hit.
    const preferred =
      results.find((r) => (r.country_code ?? '').toUpperCase() === 'VN') ?? results[0];

    if (!preferred) {
      throw new BadRequestException(
        `Không tìm thấy địa điểm "${query}". Vui lòng kiểm tra lại tên.`,
      );
    }

    return {
      name: preferred.name,
      country: preferred.country ?? '',
      admin1: preferred.admin1,
      latitude: preferred.latitude,
      longitude: preferred.longitude,
      timezone: preferred.timezone ?? 'auto',
    };
  }

  private async fetchDailyForecast(
    location: WeatherResolvedLocation,
    startDate: string,
    endDate: string,
  ): Promise<OpenMeteoDailyResponse> {
    const params = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'weathercode',
        'sunrise',
        'sunset',
        'uv_index_max',
        'wind_speed_10m_max',
      ].join(','),
      timezone: location.timezone || 'auto',
      start_date: startDate,
      end_date: endDate,
    });
    const url = `${FORECAST_URL}?${params.toString()}`;
    try {
      const data = (await this.fetchJson(url)) as OpenMeteoDailyResponse;
      if (data.error) {
        throw new Error(data.reason ?? 'Open-Meteo forecast error');
      }
      return data;
    } catch (err) {
      this.logger.warn(
        `Forecast fetch failed for ${location.name}: ${(err as Error).message}`,
      );
      throw new ServiceUnavailableException(
        'Không thể tải dự báo thời tiết. Vui lòng thử lại sau.',
      );
    }
  }

  private async fetchJson(url: string): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FORECAST_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return (await res.json()) as unknown;
    } finally {
      clearTimeout(timer);
    }
  }

  private normalizeForecast(
    raw: OpenMeteoDailyResponse,
    startDate: string,
    endDate: string,
  ): WeatherDayForecast[] {
    const daily = raw.daily;
    if (!daily?.time?.length) return [];

    const start = new Date(`${startDate}T00:00:00Z`).getTime();
    const end = new Date(`${endDate}T00:00:00Z`).getTime();

    return daily.time
      .map((dateStr, i) => {
        const ts = new Date(`${dateStr}T00:00:00Z`).getTime();
        if (ts < start || ts > end) return null;
        const code = daily.weathercode[i] ?? 0;
        const map = WMO_MAP[code] ?? { label: 'Không xác định', emoji: '🌍' };
        const day: WeatherDayForecast = {
          date: dateStr,
          weatherCode: code,
          weatherLabel: map.label,
          weatherEmoji: map.emoji,
          temperatureMax: Math.round((daily.temperature_2m_max[i] ?? 0) * 10) / 10,
          temperatureMin: Math.round((daily.temperature_2m_min[i] ?? 0) * 10) / 10,
          precipitationSum: Math.round((daily.precipitation_sum[i] ?? 0) * 10) / 10,
          uvIndexMax: Math.round((daily.uv_index_max[i] ?? 0) * 10) / 10,
          windSpeedMax: Math.round((daily.wind_speed_10m_max[i] ?? 0) * 10) / 10,
          sunrise: daily.sunrise[i] ?? '',
          sunset: daily.sunset[i] ?? '',
          advice: this.buildAdvice({
            weatherCode: code,
            precipitationSum: daily.precipitation_sum[i] ?? 0,
            temperatureMax: daily.temperature_2m_max[i] ?? 0,
            temperatureMin: daily.temperature_2m_min[i] ?? 0,
            uvIndexMax: daily.uv_index_max[i] ?? 0,
            windSpeedMax: daily.wind_speed_10m_max[i] ?? 0,
          }),
        };
        return day;
      })
      .filter((d): d is WeatherDayForecast => d !== null);
  }

  private buildAdvice(day: {
    weatherCode: number;
    precipitationSum: number;
    temperatureMax: number;
    temperatureMin: number;
    uvIndexMax: number;
    windSpeedMax: number;
  }): WeatherDayAdvice[] {
    const advice: WeatherDayAdvice[] = [];

    if (day.precipitationSum >= 10) {
      advice.push({
        icon: '🌧️',
        level: 'WARNING',
        text: 'Mưa to - mang áo mưa, ưu tiên hoạt động trong nhà.',
      });
    } else if (day.precipitationSum >= 2) {
      advice.push({
        icon: '🌦️',
        level: 'CAUTION',
        text: 'Có thể mưa - chuẩn bị áo mưa nhẹ hoặc ô.',
      });
    } else if (day.weatherCode >= 95) {
      advice.push({
        icon: '⛈️',
        level: 'WARNING',
        text: 'Dông - tránh ra biển và các hoạt động ngoài trời.',
      });
    }

    if (day.temperatureMax >= 33) {
      advice.push({
        icon: '🥵',
        level: 'WARNING',
        text: 'Nắng nóng - uống nhiều nước, tránh ra ngoài 11h-14h.',
      });
    } else if (day.temperatureMax >= 30) {
      advice.push({
        icon: '☀️',
        level: 'CAUTION',
        text: 'Trời nóng - mang nón, kem chống nắng và áo khoác nhẹ.',
      });
    }

    if (day.temperatureMin <= 12) {
      advice.push({
        icon: '🧥',
        level: 'WARNING',
        text: 'Trời rét - mang áo ấm, khăn quàng và găng tay.',
      });
    } else if (day.temperatureMin <= 18) {
      advice.push({
        icon: '🧣',
        level: 'CAUTION',
        text: 'Se lạnh về đêm/sáng - mang áo khoác nhẹ.',
      });
    }

    if (day.uvIndexMax >= 8) {
      advice.push({
        icon: '🧴',
        level: 'WARNING',
        text: 'Chỉ số UV rất cao - dùng kem chống nắng SPF 50+, đeo kính râm.',
      });
    } else if (day.uvIndexMax >= 6) {
      advice.push({
        icon: '🧴',
        level: 'CAUTION',
        text: 'Chỉ số UV cao - dùng kem chống nắng khi ra ngoài.',
      });
    }

    if (day.windSpeedMax >= 35) {
      advice.push({
        icon: '💨',
        level: 'WARNING',
        text: 'Gió mạnh - tránh thuyền, kayak và các hoạt động trên biển.',
      });
    } else if (day.windSpeedMax >= 25) {
      advice.push({
        icon: '🌬️',
        level: 'INFO',
        text: 'Có gió khá - chọn hoạt động trong nhà hoặc kín gió.',
      });
    }

    if (advice.length === 0) {
      advice.push({
        icon: '👍',
        level: 'INFO',
        text: 'Thời tiết thuận lợi - thoải mái tham quan ngoài trời.',
      });
    }
    return advice;
  }
}