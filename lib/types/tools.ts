// Tool input types
export interface SearchEventsInput {
  query: string;
  date?: string;
  category?: string;
}

export interface SearchRestaurantsInput {
  query: string;
  location?: string;
  price_level?: number;
  open_now?: boolean;
}

export interface SearchWebInput {
  query: string;
}

export interface GetSubwayStatusInput {
  station: string;
  line?: string;
}

export interface GetWeatherInput {
  // defaults to user location
}

export interface GetBikeAvailabilityInput {
  latitude: number;
  longitude: number;
}

export interface BookRideInput {
  pickup: string;
  dropoff: string;
  ride_type?: string;
}

export interface OrderFoodInput {
  restaurant_id: string;
  items: string[];
  delivery_address: string;
}

export interface CreateDeliveryInput {
  pickup_address: string;
  dropoff_address: string;
  items: string;
}

export interface BookReservationInput {
  venue_id: string;
  date: string;
  time: string;
  party_size: number;
  source: 'resy' | 'opentable';
}

export interface CheckBudgetInput {
  period?: string;
}

export interface CheckCalendarInput {
  count?: number;
}

export interface AddToCalendarInput {
  title: string;
  datetime: string;
  location: string;
}

// Tool name literal type
export type ToolName =
  | 'search_events'
  | 'search_restaurants'
  | 'search_web'
  | 'get_subway_status'
  | 'get_weather'
  | 'get_bike_availability'
  | 'book_ride'
  | 'order_food'
  | 'create_delivery'
  | 'book_reservation'
  | 'check_budget'
  | 'check_calendar'
  | 'add_to_calendar';

// Tool icon mapping
export const TOOL_ICONS: Record<ToolName, string> = {
  search_events: '🎫',
  search_restaurants: '🍽️',
  search_web: '🔍',
  get_subway_status: '🚇',
  get_weather: '🌤️',
  get_bike_availability: '🚲',
  book_ride: '🚗',
  order_food: '🍕',
  create_delivery: '📦',
  book_reservation: '🍽️',
  check_budget: '💰',
  check_calendar: '📅',
  add_to_calendar: '📅',
};

// Tool name display mapping
export const TOOL_DISPLAY_NAMES: Record<ToolName, string> = {
  search_events: 'search_events',
  search_restaurants: 'search_restaurants',
  search_web: 'search_web',
  get_subway_status: 'get_subway_status',
  get_weather: 'get_weather',
  get_bike_availability: 'get_bike_availability',
  book_ride: 'book_ride',
  order_food: 'order_food',
  create_delivery: 'create_delivery',
  book_reservation: 'book_reservation',
  check_budget: 'check_budget',
  check_calendar: 'check_calendar',
  add_to_calendar: 'add_to_calendar',
};
