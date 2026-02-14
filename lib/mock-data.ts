import type {
  ChatMessage,
  CalendarEvent,
  FinancialSummary,
  SubwayStatus,
  WeatherData,
  RideStatus,
  FoodOrder,
  ErrandStatus,
  Reservation,
  EventListing,
  SearchResult,
  BikeStation,
  Restaurant,
} from '@/lib/types';

// Calendar events
export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Hackathon Demo',
    datetime: new Date(Date.now() + 25 * 60000).toISOString(),
    location: 'David Geffen Hall',
    duration: 120,
  },
  {
    id: 'cal-2',
    title: 'Dinner with Sarah',
    datetime: new Date(Date.now() + 5 * 3600000).toISOString(),
    location: 'Carbone, 181 Thompson St',
    duration: 90,
  },
  {
    id: 'cal-3',
    title: 'Morning Standup',
    datetime: new Date(Date.now() + 18 * 3600000).toISOString(),
    location: 'Zoom',
    duration: 30,
  },
];

// Financial summary
export const mockFinancialSummary: FinancialSummary = {
  checkingBalance: 3450,
  weeklySpend: 680,
  weeklyBudget: 1200,
  categories: [
    { name: 'Food', amount: 245, color: '#34d399' },
    { name: 'Transport', amount: 180, color: '#8b5cf6' },
    { name: 'Entertainment', amount: 155, color: '#22d3ee' },
    { name: 'Shopping', amount: 100, color: '#fbbf24' },
  ],
  dailySpend: [85, 120, 95, 140, 110, 75, 55],
};

// Subway status
export const mockSubwayStatus: SubwayStatus = {
  station: 'Spring St',
  arrivals: [
    { line: '6', direction: 'uptown', arrivalTime: new Date(Date.now() + 3 * 60000), minutesAway: 3 },
    { line: '6', direction: 'uptown', arrivalTime: new Date(Date.now() + 11 * 60000), minutesAway: 11 },
    { line: '6', direction: 'downtown', arrivalTime: new Date(Date.now() + 5 * 60000), minutesAway: 5 },
    { line: '6', direction: 'downtown', arrivalTime: new Date(Date.now() + 14 * 60000), minutesAway: 14 },
  ],
  alerts: ['Signal delays on 1/2/3 lines, expect 8-12 min additional travel time'],
};

// Weather
export const mockWeather: WeatherData = {
  temp: 34,
  feelsLike: 28,
  condition: 'Clear',
  icon: '01d',
  humidity: 45,
  wind: 12,
  hourlyForecast: [
    { time: '5PM', temp: 34, condition: 'Clear', icon: '01d' },
    { time: '6PM', temp: 32, condition: 'Clear', icon: '01n' },
    { time: '7PM', temp: 30, condition: 'Clouds', icon: '02n' },
    { time: '8PM', temp: 29, condition: 'Clouds', icon: '03n' },
  ],
};

// Ride status
export const mockRideStatus: RideStatus = {
  id: 'ride-001',
  driverName: 'Marcus',
  vehicle: 'Black Tesla Model Y',
  licensePlate: 'T649-82C',
  etaMinutes: 4,
  fare: '$24',
  status: 'en_route',
  pickup: 'Broadway & Spring St',
  dropoff: 'David Geffen Hall',
  routeCoordinates: [
    [-73.9976, 40.7243],
    [-74.006, 40.7258],
    [-74.0099, 40.731],
    [-74.0089, 40.742],
    [-74.002, 40.756],
    [-73.987, 40.768],
    [-73.9835, 40.7725],
  ],
  driverLocation: [-74.002, 40.735],
};

// Food order
export const mockFoodOrder: FoodOrder = {
  id: 'food-001',
  restaurant: 'Absolute Bagels',
  items: [
    { name: 'Everything Bagel w/ Cream Cheese', quantity: 1, price: 3.5 },
    { name: 'Iced Coffee', quantity: 1, price: 4.0 },
  ],
  subtotal: 7.5,
  tax: 0.67,
  tip: 0.95,
  total: 9.12,
  status: 'en_route',
  etaMinutes: 20,
  dasherName: 'Priya',
};

// Errand
export const mockErrand: ErrandStatus = {
  id: 'errand-001',
  pickupAddress: 'CVS Pharmacy, 200 Varick St',
  dropoffAddress: 'David Geffen Hall, 10 Lincoln Center Plaza',
  items: 'Phone charger, Advil, water bottle',
  dasherName: 'James',
  status: 'picking_up',
  etaMinutes: 35,
};

// Reservation
export const mockReservation: Reservation = {
  id: 'res-001',
  venue: 'Carbone',
  date: 'Fri Feb 14',
  time: '7:30 PM',
  partySize: 2,
  confirmationCode: 'RES-48291',
  source: 'resy',
  status: 'confirmed',
};

// Events
export const mockEvents: EventListing[] = [
  {
    id: 'evt-1',
    name: 'NY Knicks vs. Boston Celtics',
    venue: 'Madison Square Garden',
    date: 'Sat Feb 15',
    time: '7:30 PM',
    priceRange: '$85 - $450',
    availability: 'available',
    genre: 'Sports',
    url: 'https://www.ticketmaster.com',
  },
  {
    id: 'evt-2',
    name: 'Wicked',
    venue: 'Gershwin Theatre',
    date: 'Tonight',
    time: '8:00 PM',
    priceRange: '$120 - $350',
    availability: 'limited',
    genre: 'Theater',
    url: 'https://www.ticketmaster.com',
  },
  {
    id: 'evt-3',
    name: 'Arlo Parks',
    venue: 'Brooklyn Steel',
    date: 'Sun Feb 16',
    time: '9:00 PM',
    priceRange: '$45 - $65',
    availability: 'available',
    genre: 'Music',
    url: 'https://www.ticketmaster.com',
  },
];

// Search results
export const mockSearchResults: SearchResult[] = [
  {
    title: 'Best Late Night Pizza in Manhattan - Eater NY',
    url: 'https://ny.eater.com/maps/best-late-night-pizza-nyc',
    snippet: 'From dollar slices to coal-fired pies, these are the best spots for pizza after midnight in NYC.',
    domain: 'ny.eater.com',
  },
  {
    title: "Joe's Pizza - Greenwich Village",
    url: 'https://www.joespizzanyc.com',
    snippet: 'Classic NYC slice joint since 1975. Open until 4 AM daily. Cash and card accepted.',
    domain: 'joespizzanyc.com',
  },
  {
    title: 'Prince Street Pizza - Nolita',
    url: 'https://princestreetpizza.com',
    snippet: 'Famous for their pepperoni square. Usually a line but worth the wait.',
    domain: 'princestreetpizza.com',
  },
];

// Bike availability
export const mockBikeStations: BikeStation[] = [
  { name: 'Broadway & Spring St', availableBikes: 8, availableDocks: 15, distance: '0.1 mi', walkingMinutes: 2 },
  { name: 'Lafayette St & Jersey St', availableBikes: 3, availableDocks: 22, distance: '0.2 mi', walkingMinutes: 4 },
  { name: 'Mercer St & Spring St', availableBikes: 0, availableDocks: 25, distance: '0.3 mi', walkingMinutes: 5 },
];

// Restaurants
export const mockRestaurants: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Carbone',
    rating: 4.7,
    priceLevel: 4,
    cuisine: ['Italian', 'Fine Dining'],
    address: '181 Thompson St',
    isOpen: true,
  },
  {
    id: 'rest-2',
    name: 'Xi\'an Famous Foods',
    rating: 4.5,
    priceLevel: 1,
    cuisine: ['Chinese', 'Noodles'],
    address: '45 Bayard St',
    isOpen: true,
  },
  {
    id: 'rest-3',
    name: 'Balthazar',
    rating: 4.4,
    priceLevel: 3,
    cuisine: ['French', 'Bistro'],
    address: '80 Spring St',
    isOpen: true,
  },
];

// Budget summary (tool result)
export const mockBudgetResult = {
  checkingBalance: 3450,
  weeklySpend: 680,
  weeklyBudget: 1200,
  percentUsed: 57,
  categories: [
    { name: 'Food', amount: 245 },
    { name: 'Transport', amount: 180 },
    { name: 'Entertainment', amount: 155 },
    { name: 'Shopping', amount: 100 },
  ],
};

// Demo conversation messages
export function getDemoMessages(): ChatMessage[] {
  const now = Date.now();
  return [
    {
      id: 'demo-1',
      role: 'user',
      content: "I'm running late for the hackathon demo at Columbia",
      timestamp: new Date(now - 120000),
      status: 'complete',
    },
    {
      id: 'demo-2',
      role: 'reasoning',
      content: "Let me check your schedule and figure out the fastest way to get you there...",
      timestamp: new Date(now - 118000),
      status: 'complete',
    },
    {
      id: 'demo-3',
      role: 'tool_call',
      content: '',
      toolName: 'check_calendar',
      toolArgs: { count: 3 },
      status: 'complete',
      timestamp: new Date(now - 116000),
    },
    {
      id: 'demo-4',
      role: 'reasoning',
      content: "You have 'Hackathon Demo' at David Geffen Hall in 25 minutes. Let me check the subway first — it's usually fastest.",
      timestamp: new Date(now - 114000),
      status: 'complete',
    },
    {
      id: 'demo-5',
      role: 'tool_call',
      content: '',
      toolName: 'get_subway_status',
      toolArgs: { station: 'Spring St', line: '6' },
      status: 'complete',
      timestamp: new Date(now - 112000),
    },
    {
      id: 'demo-6',
      role: 'tool_result',
      content: '',
      toolName: 'get_subway_status',
      toolResult: mockSubwayStatus,
      cardType: 'subway_status',
      status: 'complete',
      timestamp: new Date(now - 110000),
    },
    {
      id: 'demo-7',
      role: 'reasoning',
      content: "The 1 train has signal delays. That'd make you late. Let me check the weather and grab you a ride instead.",
      timestamp: new Date(now - 108000),
      status: 'complete',
    },
    {
      id: 'demo-8',
      role: 'tool_call',
      content: '',
      toolName: 'get_weather',
      toolArgs: {},
      status: 'complete',
      timestamp: new Date(now - 106000),
    },
    {
      id: 'demo-9',
      role: 'tool_result',
      content: '34\u00B0F, clear skies',
      toolName: 'get_weather',
      toolResult: mockWeather,
      cardType: 'weather',
      status: 'complete',
      timestamp: new Date(now - 104000),
    },
    {
      id: 'demo-10',
      role: 'tool_call',
      content: '',
      toolName: 'book_ride',
      toolArgs: { pickup: 'Broadway & Spring St', dropoff: 'David Geffen Hall', ride_type: 'UberX' },
      status: 'complete',
      timestamp: new Date(now - 102000),
    },
    {
      id: 'demo-11',
      role: 'tool_result',
      content: '',
      toolName: 'book_ride',
      toolResult: mockRideStatus,
      cardType: 'ride_status',
      status: 'complete',
      timestamp: new Date(now - 100000),
    },
    {
      id: 'demo-12',
      role: 'reasoning',
      content: "You haven't eaten since this morning. Let me get something delivered to Geffen Hall.",
      timestamp: new Date(now - 98000),
      status: 'complete',
    },
    {
      id: 'demo-13',
      role: 'tool_call',
      content: '',
      toolName: 'order_food',
      toolArgs: { restaurant_id: 'absolute-bagels', items: ['Everything Bagel w/ Cream Cheese', 'Iced Coffee'], delivery_address: 'David Geffen Hall' },
      status: 'complete',
      timestamp: new Date(now - 96000),
    },
    {
      id: 'demo-14',
      role: 'tool_result',
      content: '',
      toolName: 'order_food',
      toolResult: mockFoodOrder,
      cardType: 'food_order',
      status: 'complete',
      timestamp: new Date(now - 94000),
    },
    {
      id: 'demo-15',
      role: 'assistant',
      content: "All set. Marcus is 4 minutes away in a black Model Y \u2014 he'll pick you up on Broadway. I also ordered you a bagel and iced coffee from Absolute Bagels, should arrive at Geffen Hall in about 20 minutes. You're at 62% of your weekly budget. Good luck with the demo!",
      timestamp: new Date(now - 92000),
      status: 'complete',
    },
  ];
}

// Mission history items
export const mockMissionHistory = [
  { icon: '🚗', summary: 'Booked ride to David Geffen Hall', time: new Date(Date.now() - 100000) },
  { icon: '🍕', summary: 'Ordered from Absolute Bagels', time: new Date(Date.now() - 94000) },
  { icon: '🚇', summary: 'Checked Spring St subway status', time: new Date(Date.now() - 110000) },
  { icon: '🌤️', summary: 'Checked weather conditions', time: new Date(Date.now() - 104000) },
];
