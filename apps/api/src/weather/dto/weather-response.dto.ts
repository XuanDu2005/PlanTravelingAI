export interface WeatherDayAdvice {
  icon: string;
  level: 'INFO' | 'CAUTION' | 'WARNING';
  text: string;
}

export interface WeatherDayForecast {
  date: string;
  weatherCode: number;
  weatherLabel: string;
  weatherEmoji: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationSum: number;
  uvIndexMax: number;
  windSpeedMax: number;
  sunrise: string;
  sunset: string;
  advice: WeatherDayAdvice[];
}

export interface WeatherResolvedLocation {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface WeatherForecastResponse {
  destination: string;
  resolvedLocation: WeatherResolvedLocation;
  units: {
    temperature: '°C';
    precipitation: 'mm';
    windSpeed: 'km/h';
    uvIndex: 'index';
  };
  fetchedAt: string;
  days: WeatherDayForecast[];
  itineraryAlignment?: Array<{
    day: number;
    date: string;
    theme: string;
    forecast: WeatherDayForecast;
  }>;
}