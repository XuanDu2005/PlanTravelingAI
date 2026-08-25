export type UserRole = 'USER' | 'ADMIN';
export type TripStatus = 'DRAFT' | 'GENERATED' | 'ARCHIVED';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  language?: string;
  avatar?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'LOCKED';
  language: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  location: string;
  estimatedCost: string;
  transport: string;
  imageUrl: string;
  imageSourceUrl?: string;
  category: string;
  suggestedPlaces?: Array<{
    name: string;
    address: string;
    specialty: string;
    priceRange: string;
  }>;
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

export interface TripItinerary {
  id: string;
  title: string;
  description: string;
  content: GeneratedItinerary | null;
  createdAt: string;
  updatedAt: string;
  versionCount?: number;
}

export interface TripExpense {
  id: string;
  title: string;
  category: string;
  amount: number;
  paidBy: string;
  spentAt: string;
  createdAt: string;
}

export interface TripPackingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  isPacked: boolean;
  createdAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  preferences: string;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
  itinerary: TripItinerary | null;
  expenses: TripExpense[];
  packingItems: TripPackingItem[];
}

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

export type RecCategory =
  | 'NATURE'
  | 'CULTURE'
  | 'RESORT'
  | 'ADVENTURE'
  | 'BEACH';

export interface RecommendationSummary {
  id: string;
  title: string;
  description: string;
  destination: string;
  image: string;
  isPublished: boolean;
  category: RecCategory;
  price: number;
  rating: number;
  reviewCount: number;
  daysCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation extends RecommendationSummary {
  content: GeneratedItinerary | null;
  reviews?: RecommendationReview[];
}

export interface RecommendationReview {
  id: string;
  recommendationId: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecommendationPayload {
  title: string;
  description: string;
  destination: string;
  image?: string;
  content: string;
  isPublished?: boolean;
  category?: RecCategory;
  price?: number;
  rating?: number;
  reviewCount?: number;
}

export interface UpdateRecommendationPayload
  extends Partial<CreateRecommendationPayload> {}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'LOCKED';
  createdAt: string;
}

export interface AdminTrip {
  id: string;
  userId: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  preferences: string;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalTrips: number;
  totalRecommendations: number;
  publishedRecommendations: number;
}

export interface AdminAnalyticsMonthlyBucket {
  key: string;
  label: string;
  count: number;
}

export interface AdminAnalyticsCategorySlice {
  category: string;
  count: number;
}

export interface AdminAnalyticsTopDestination {
  destination: string;
  count: number;
}

export interface AdminAnalyticsRecentTrip {
  id: string;
  destination: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export interface AdminAnalyticsRecentSignup {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AdminAnalytics {
  totals: {
    users: number;
    trips: number;
    recommendations: number;
    publishedRecommendations: number;
    favorites: number;
    lockedUsers: number;
  };
  monthlyTrips: AdminAnalyticsMonthlyBucket[];
  recsByCategory: AdminAnalyticsCategorySlice[];
  topTripDestinations: AdminAnalyticsTopDestination[];
  recentTrips: AdminAnalyticsRecentTrip[];
  recentSignups: AdminAnalyticsRecentSignup[];
}

export interface CreateTripPayload {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  preferences?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  language?: 'vi' | 'en';
  avatar?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export type ChatRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ChatSessionSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSendResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export interface AdminHeroSlide {
  id: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type HeroSlideUpdatePayload = Partial<{
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}>;

export type HeroSlideCreatePayload = {
  imageUrl: string;
  sortOrder?: number;
  isActive?: boolean;
};

export interface AppNotification {
  id: string;
  type: 'INFO' | 'WEATHER' | 'COLLABORATION' | 'BOOKING';
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}
