export type MessageRole = 'user' | 'assistant' | 'tool_call' | 'tool_result' | 'reasoning';

export type CardType =
  | 'ride_status'
  | 'food_order'
  | 'errand'
  | 'reservation'
  | 'event'
  | 'search_results'
  | 'subway_status'
  | 'weather'
  | 'bike_availability'
  | 'budget_summary'
  | 'restaurant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: unknown;
  cardType?: CardType;
  status?: 'pending' | 'streaming' | 'complete' | 'error';
  timestamp: Date;
}

export type AgentState = 'idle' | 'thinking' | 'executing' | 'done';

// Calendar
export interface CalendarEvent {
  id: string;
  title: string;
  datetime: string;
  location: string;
  duration: number; // minutes
}

// Financial
export interface FinancialSummary {
  checkingBalance: number;
  weeklySpend: number;
  weeklyBudget: number;
  categories: SpendingCategory[];
  dailySpend: number[];
}

export interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
}

// Subway
export interface SubwayArrival {
  line: string;
  direction: 'uptown' | 'downtown';
  arrivalTime: Date;
  minutesAway: number;
}

export interface SubwayStatus {
  station: string;
  arrivals: SubwayArrival[];
  alerts: string[];
}

// Weather
export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  icon: string;
  humidity: number;
  wind: number;
  hourlyForecast: HourlyForecast[];
}

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  icon: string;
}

// Ride
export interface RideStatus {
  id: string;
  driverName: string;
  vehicle: string;
  licensePlate: string;
  etaMinutes: number;
  fare: string;
  status: 'requested' | 'driver_assigned' | 'en_route' | 'arriving' | 'complete';
  pickup: string;
  dropoff: string;
  routeCoordinates?: [number, number][];
  driverLocation?: [number, number];
}

// Food Order
export interface FoodOrder {
  id: string;
  restaurant: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  status: 'confirmed' | 'preparing' | 'dasher_assigned' | 'en_route' | 'delivered';
  etaMinutes: number;
  dasherName?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

// Errand
export interface ErrandStatus {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  items: string;
  dasherName?: string;
  status: 'assigned' | 'picking_up' | 'en_route' | 'delivered';
  etaMinutes: number;
}

// Reservation
export interface Reservation {
  id: string;
  venue: string;
  date: string;
  time: string;
  partySize: number;
  confirmationCode: string;
  source: 'resy' | 'opentable';
  status: 'confirmed' | 'pending';
}

// Event
export interface EventListing {
  id: string;
  name: string;
  venue: string;
  date: string;
  time: string;
  priceRange: string;
  availability: 'available' | 'limited' | 'sold_out';
  genre: string;
  url: string;
  imageUrl?: string;
}

// Search Result
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

// Bike Availability
export interface BikeStation {
  name: string;
  availableBikes: number;
  availableDocks: number;
  distance: string;
  walkingMinutes: number;
}

// Restaurant
export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  priceLevel: number;
  cuisine: string[];
  address: string;
  isOpen: boolean;
  photoUrl?: string;
}
