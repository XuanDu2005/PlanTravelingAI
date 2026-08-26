export interface TripItineraryInput {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  /** Raw VND amount (integer). e.g. 5000000 = 5 million VND. */
  budget: number;
  preferences: string;
}

export interface PackingItemSuggestion {
  name: string;
  category: string;
  quantity: number;
}

export interface PackingListInput {
  destination: string;
  daysCount: number;
  travelers: number;
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
  generatePackingList(input: PackingListInput): Promise<PackingItemSuggestion[]>;
  chat(messages: AiChatMessage[]): Promise<string>;
}

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
