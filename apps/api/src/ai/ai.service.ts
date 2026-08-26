import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from './ai.tokens';
import {
  AiChatMessage,
  AiProvider,
  GeneratedItinerary,
  PackingItemSuggestion,
  PackingListInput,
  TripItineraryInput,
} from './ai.types';

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PROVIDER) private readonly provider: AiProvider,
  ) {}

  generateItinerary(input: TripItineraryInput): Promise<GeneratedItinerary> {
    return this.provider.generateItinerary(input);
  }

  generatePackingList(input: PackingListInput): Promise<PackingItemSuggestion[]> {
    return this.provider.generatePackingList(input);
  }

  chat(messages: AiChatMessage[]): Promise<string> {
    return this.provider.chat(messages);
  }
}
