export interface TripItineraryInput {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: string;
  preferences: string;
}

export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  location: string;
  estimatedCost: string;
  transport: string;
  imageUrl: string;
  category: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  theme: string;
  activities: ItineraryActivity[];
}

export interface GeneratedItinerary {
  title: string;
  summary: string;
  coverImage: string;
  days: ItineraryDay[];
  tips: string[];
}

export interface AiProvider {
  generateItinerary(input: TripItineraryInput): Promise<GeneratedItinerary>;
  chat(messages: AiChatMessage[]): Promise<string>;
}

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
