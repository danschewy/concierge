import type { Tool } from '@anthropic-ai/sdk/resources/messages/messages';

export const TOOL_DEFINITIONS: Tool[] = [
  {
    name: 'search_events',
    description:
      'Search for upcoming events, concerts, shows, and performances in New York City. Covers Broadway, Madison Square Garden, Barclays Center, Lincoln Center, and all major NYC venues. Use this when the user asks about things to do, events, shows, concerts, or nightlife.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Search query for events, e.g. "jazz tonight", "Broadway shows", "Knicks game"',
        },
        date: {
          type: 'string',
          description:
            'Date to search for events in YYYY-MM-DD format. Defaults to today if not specified.',
        },
        category: {
          type: 'string',
          description:
            'Event category filter: "music", "sports", "arts", "comedy", "theater", "family"',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_restaurants',
    description:
      'Search for restaurants, cafes, bars, and eateries across NYC neighborhoods. Returns ratings, price levels, cuisine types, and open/closed status. Use this when the user asks about food, dining, restaurants, or places to eat.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Search query for restaurants, e.g. "best ramen in SoHo", "rooftop bar midtown", "late night pizza"',
        },
        location: {
          type: 'string',
          description:
            'NYC neighborhood or address to search near, e.g. "SoHo", "Upper West Side", "Williamsburg". Defaults to SoHo.',
        },
        price_level: {
          type: 'number',
          description:
            'Price level filter: 1 = budget ($), 2 = moderate ($$), 3 = upscale ($$$), 4 = fine dining ($$$$)',
        },
        open_now: {
          type: 'boolean',
          description: 'If true, only return restaurants that are currently open.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_web',
    description:
      'Perform a general web search for information not covered by other tools. Use for NYC-specific questions, local news, venue details, neighborhood guides, or anything else the user might need.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The web search query.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_subway_status',
    description:
      'Get real-time MTA subway arrival times, service alerts, and delay information for a specific station. Covers all NYC subway lines (1-7, A-G, J, L, M, N, Q, R, S, W, Z). If station is omitted, defaults to a station near the user location. Use this to check commute viability and decide between subway vs. rideshare.',
    input_schema: {
      type: 'object',
      properties: {
        station: {
          type: 'string',
          description:
            'Optional subway station name, e.g. "Spring St", "Times Sq-42 St", "Broadway-Lafayette". Defaults to nearest station to the user location.',
        },
        line: {
          type: 'string',
          description:
            'Specific subway line to check, e.g. "6", "A", "N". If omitted, returns all lines at the station.',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_weather',
    description:
      'Get current weather conditions and hourly forecast for New York City. Returns temperature, feels-like, wind speed, humidity, and conditions. Always call this before recommending outdoor activities, walking routes, or Citi Bike rides.',
    input_schema: {
      type: 'object',
      properties: {
        latitude: {
          type: 'number',
          description:
            'Optional latitude override. If omitted, defaults to the user location.',
        },
        longitude: {
          type: 'number',
          description:
            'Optional longitude override. If omitted, defaults to the user location.',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_bike_availability',
    description:
      'Check Citi Bike station availability near a given location in NYC. Returns nearby stations with available bikes and docks, walking distance, and estimated walk time. Best for short trips under 3 miles in good weather.',
    input_schema: {
      type: 'object',
      properties: {
        latitude: {
          type: 'number',
          description: 'Latitude of the location to search near.',
        },
        longitude: {
          type: 'number',
          description: 'Longitude of the location to search near.',
        },
      },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'book_ride',
    description:
      'Book an Uber ride in NYC. Supports UberX, UberXL, Uber Black, and Uber Comfort. Use this when the subway is delayed, weather is bad, or the user is running late and needs a car. If pickup is omitted, defaults to the user location. Always check the user budget first for premium ride types.',
    input_schema: {
      type: 'object',
      properties: {
        pickup: {
          type: 'string',
          description:
            'Optional pickup address or intersection in NYC, e.g. "Broadway & Spring St". Defaults to user location.',
        },
        dropoff: {
          type: 'string',
          description:
            'Dropoff address or venue name, e.g. "Lincoln Center", "JFK Airport"',
        },
        ride_type: {
          type: 'string',
          description:
            'Type of ride: "UberX" (default), "UberXL", "Uber Black", "Uber Comfort"',
        },
      },
      required: ['dropoff'],
    },
  },
  {
    name: 'order_food',
    description:
      'Place a food delivery order from an NYC restaurant via MealMe. Requires a restaurant ID from a prior search_restaurants call. Specify menu items and delivery address.',
    input_schema: {
      type: 'object',
      properties: {
        restaurant_id: {
          type: 'string',
          description:
            'The restaurant ID obtained from a previous search_restaurants result.',
        },
        items: {
          type: 'array',
          items: { type: 'string' },
          description:
            'List of menu item names to order, e.g. ["Margherita Pizza", "Caesar Salad"]',
        },
        delivery_address: {
          type: 'string',
          description: 'Delivery address in NYC.',
        },
      },
      required: ['restaurant_id', 'items', 'delivery_address'],
    },
  },
  {
    name: 'create_delivery',
    description:
      'Create a DoorDash Drive delivery to pick up items from one NYC location and deliver to another. Use for errands like picking up dry cleaning, pharmacy orders, or packages. If pickup is omitted, defaults to the user location.',
    input_schema: {
      type: 'object',
      properties: {
        pickup_address: {
          type: 'string',
          description: 'Optional address to pick up items from. Defaults to user location.',
        },
        dropoff_address: {
          type: 'string',
          description: 'Address to deliver items to.',
        },
        items: {
          type: 'string',
          description:
            'Description of items to be picked up and delivered, e.g. "2 suits from dry cleaner", "prescription from CVS"',
        },
      },
      required: ['dropoff_address', 'items'],
    },
  },
  {
    name: 'book_reservation',
    description:
      'Book a restaurant reservation in NYC through Resy or OpenTable. Specify the venue, date, time, and party size. Use search_restaurants first to find the venue ID. Always check the user budget before booking expensive restaurants.',
    input_schema: {
      type: 'object',
      properties: {
        venue_id: {
          type: 'string',
          description:
            'The venue ID from a previous search_restaurants result.',
        },
        date: {
          type: 'string',
          description: 'Reservation date in YYYY-MM-DD format.',
        },
        time: {
          type: 'string',
          description: 'Reservation time in HH:MM format (24-hour), e.g. "19:30".',
        },
        party_size: {
          type: 'number',
          description: 'Number of guests for the reservation.',
        },
        source: {
          type: 'string',
          description:
            'Reservation platform to use: "resy" or "opentable". Defaults to "resy" for NYC restaurants.',
        },
      },
      required: ['venue_id', 'date', 'time', 'party_size', 'source'],
    },
  },
  {
    name: 'check_budget',
    description:
      'Check the user\'s financial summary via Plaid. Returns checking balance, weekly spending, budget remaining, and spending by category. Always call this before suggesting expensive options like Uber Black, fine dining, or premium event tickets.',
    input_schema: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          description:
            'Time period to check spending: "daily", "weekly" (default), "monthly"',
        },
      },
      required: [],
    },
  },
  {
    name: 'check_calendar',
    description:
      'Retrieve the user\'s upcoming calendar events. Returns event titles, times, locations, and durations. Use proactively to check for conflicts before booking, or when the user mentions being busy or running late.',
    input_schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description:
            'Number of upcoming events to return. Defaults to 5.',
        },
      },
      required: [],
    },
  },
  {
    name: 'add_to_calendar',
    description:
      'Add a new event to the user\'s calendar. Use after booking reservations, rides, or events to keep the user\'s schedule updated. Include the venue address as the location.',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Event title, e.g. "Dinner at Balthazar", "Knicks vs. Celtics"',
        },
        datetime: {
          type: 'string',
          description: 'Event start time in ISO 8601 format, e.g. "2025-03-15T19:30:00"',
        },
        location: {
          type: 'string',
          description: 'Event location or venue address in NYC.',
        },
      },
      required: ['title', 'datetime', 'location'],
    },
  },
];
