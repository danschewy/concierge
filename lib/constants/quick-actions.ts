import { COOL_TEST_MESSAGE } from '@/lib/constants/prompts';

export interface QuickActionItem {
  id: string;
  icon: string;
  label: string;
  description: string;
  prefill: string;
}

export interface QuickActionGroup {
  id: string;
  title: string;
  actions: QuickActionItem[];
}

export const FEATURED_QUICK_ACTION: QuickActionItem = {
  id: 'cool-test-message',
  icon: '🧪',
  label: 'Cool Test Message',
  description: 'Runs a multi-tool live systems check prompt.',
  prefill: COOL_TEST_MESSAGE,
};

export const QUICK_ACTION_GROUPS: QuickActionGroup[] = [
  {
    id: 'live-now',
    title: 'Live Now',
    actions: [
      {
        id: 'subway-nearby',
        icon: '🚇',
        label: 'Subway',
        description: 'Check nearby trains and delays right now.',
        prefill: "When's the next train near me?",
      },
      {
        id: 'bike-nearby',
        icon: '🚲',
        label: 'Bike',
        description: 'See Citi Bike stations near my location.',
        prefill: 'Any Citi Bikes available near me?',
      },
      {
        id: 'status-board',
        icon: '📊',
        label: 'Status Board',
        description: 'Weather, transit, bikes, and disruption summary.',
        prefill:
          'Build a live status board for my exact current location. Call tools in this order: get_weather, get_subway_status for the nearest busy station, get_bike_availability near me, and search_web for NYC disruptions in the next 6 hours. Then return a concise summary with a commute risk rating.',
      },
      {
        id: 'disruption-radar',
        icon: '⚠️',
        label: 'Disruptions',
        description: 'Scan for transit or citywide service issues.',
        prefill:
          'Check live NYC disruptions near me tonight. Use get_subway_status and search_web, then summarize what could impact travel.',
      },
    ],
  },
  {
    id: 'plans',
    title: 'Plans',
    actions: [
      {
        id: 'commute-decision',
        icon: '🧭',
        label: 'Commute Decision',
        description: 'Compare subway, bike, and ride options.',
        prefill:
          'I need to get to [destination]. Compare subway vs Citi Bike vs rideshare now using get_subway_status, get_bike_availability, and get_weather. Give ETA, reliability, and cost range. Do not place bookings.',
      },
      {
        id: 'running-late',
        icon: '⏱️',
        label: 'Running Late',
        description: 'Build a fast rescue plan from my next event.',
        prefill:
          "I'm running late. Check my next event with check_calendar, then check transit and weather. Recommend the fastest plan and a backup. Do not place bookings.",
      },
      {
        id: 'tonight-plan',
        icon: '🌃',
        label: 'Tonight Plan',
        description: 'Budget-aware event + dinner options.',
        prefill:
          'Plan tonight near me under a moderate budget. Use check_budget, search_events, and search_restaurants. Give one event, two dinner options, and transit advice.',
      },
      {
        id: 'weekend-explorer',
        icon: '🎟️',
        label: 'Weekend',
        description: 'Find high-value events this weekend.',
        prefill:
          'Find 5 great NYC events this weekend near me. Use search_events and search_web for validation, then rank by value and convenience.',
      },
      {
        id: 'spend-pulse',
        icon: '💳',
        label: 'Spend Pulse',
        description: 'Get weekly spending and budget remaining.',
        prefill:
          'Show my weekly spending summary and remaining budget with check_budget. Include top categories and one practical recommendation.',
      },
    ],
  },
  {
    id: 'services',
    title: 'Services',
    actions: [
      {
        id: 'ride-request',
        icon: '🚗',
        label: 'Ride',
        description: 'Draft a ride request from my current location.',
        prefill: 'Get me a ride to ',
      },
      {
        id: 'food-open-now',
        icon: '🍕',
        label: 'Open Food',
        description: 'Find the best open food options nearby.',
        prefill:
          'Find open food options near me right now and recommend the best one for quick delivery.',
      },
      {
        id: 'errand-delivery',
        icon: '📦',
        label: 'Errand',
        description: 'Set up a pickup and dropoff delivery.',
        prefill:
          'I need a pickup and delivery run. Help me create a delivery request from my location to [destination] for [items].',
      },
      {
        id: 'doordash-candy-test',
        icon: '🍬',
        label: 'DD Candy Test',
        description: 'Run a prebuilt DoorDash test to Times Square.',
        prefill:
          'Use create_delivery with pickup_address "157 William St, New York, NY 10038", dropoff_address "Times Square, Manhattan, New York, NY 10036", and items "Candy".',
      },
      {
        id: 'web-search',
        icon: '🔍',
        label: 'Search',
        description: 'Run a focused web search task.',
        prefill: 'Search for ',
      },
    ],
  },
];

export const MOBILE_QUICK_ACTIONS: QuickActionItem[] = [
  FEATURED_QUICK_ACTION,
  ...QUICK_ACTION_GROUPS.flatMap((group) => group.actions),
];
