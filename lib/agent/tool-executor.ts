import type { CardType } from '@/lib/types';
import * as ticketmaster from '@/lib/services/ticketmaster';
import * as places from '@/lib/services/places';
import * as tavily from '@/lib/services/tavily';
import * as mta from '@/lib/services/mta';
import * as weather from '@/lib/services/weather';
import * as citibike from '@/lib/services/citibike';
import * as uber from '@/lib/services/uber';
import * as mealme from '@/lib/services/mealme';
import * as doordash from '@/lib/services/doordash';
import * as resy from '@/lib/services/resy';
import * as opentable from '@/lib/services/opentable';
import * as plaid from '@/lib/services/plaid';
import * as calendar from '@/lib/services/calendar';

interface ToolExecutionResult {
  result: unknown;
  cardType?: CardType;
}

export async function executeTool(
  toolName: string,
  toolArgs: Record<string, unknown>
): Promise<ToolExecutionResult> {
  switch (toolName) {
    case 'search_events': {
      const result = await ticketmaster.searchEvents(
        toolArgs.query as string,
        toolArgs.date as string | undefined,
        toolArgs.category as string | undefined
      );
      return { result, cardType: 'event' };
    }

    case 'search_restaurants': {
      const result = await places.searchRestaurants(
        toolArgs.query as string,
        toolArgs.location as string | undefined,
        toolArgs.price_level as number | undefined,
        toolArgs.open_now as boolean | undefined
      );
      return { result, cardType: 'restaurant' };
    }

    case 'search_web': {
      const result = await tavily.searchWeb(toolArgs.query as string);
      return { result, cardType: 'search_results' };
    }

    case 'get_subway_status': {
      const result = await mta.getSubwayStatus(
        toolArgs.station as string,
        toolArgs.line as string | undefined
      );
      return { result, cardType: 'subway_status' };
    }

    case 'get_weather': {
      const result = await weather.getWeather();
      return { result, cardType: 'weather' };
    }

    case 'get_bike_availability': {
      const result = await citibike.getBikeAvailability(
        toolArgs.latitude as number,
        toolArgs.longitude as number
      );
      return { result, cardType: 'bike_availability' };
    }

    case 'book_ride': {
      const result = await uber.bookRide(
        toolArgs.pickup as string,
        toolArgs.dropoff as string,
        toolArgs.ride_type as string | undefined
      );
      return { result, cardType: 'ride_status' };
    }

    case 'order_food': {
      const result = await mealme.orderFood(
        toolArgs.restaurant_id as string,
        toolArgs.items as string[],
        toolArgs.delivery_address as string
      );
      return { result, cardType: 'food_order' };
    }

    case 'create_delivery': {
      const result = await doordash.createDelivery(
        toolArgs.pickup_address as string,
        toolArgs.dropoff_address as string,
        toolArgs.items as string
      );
      return { result, cardType: 'errand' };
    }

    case 'book_reservation': {
      const result =
        toolArgs.source === 'opentable'
          ? await opentable.bookReservation(
              toolArgs.venue_id as string,
              toolArgs.date as string,
              toolArgs.time as string,
              toolArgs.party_size as number
            )
          : await resy.bookReservation(
              toolArgs.venue_id as string,
              toolArgs.date as string,
              toolArgs.time as string,
              toolArgs.party_size as number
            );
      return { result, cardType: 'reservation' };
    }

    case 'check_budget': {
      const result = await plaid.getTransactions(toolArgs.period as string | undefined);
      return { result, cardType: 'budget_summary' };
    }

    case 'check_calendar': {
      const result = await calendar.getCalendarEvents(toolArgs.count as number | undefined);
      return { result };
    }

    case 'add_to_calendar': {
      const result = await calendar.addCalendarEvent(
        toolArgs.title as string,
        toolArgs.datetime as string,
        toolArgs.location as string
      );
      return { result };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
