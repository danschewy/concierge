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

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isCoordinateLocationLabel(value: string): boolean {
  return /^current location \(-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?\)$/i.test(value);
}

function isLocationPlaceholder(value: string): boolean {
  const normalized = value.toLowerCase();
  if (!normalized) return true;
  if (isCoordinateLocationLabel(value)) return false;
  return (
    normalized === 'current location' ||
    normalized === 'near me' ||
    normalized === 'my location' ||
    normalized === 'here'
  );
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
      const station =
        typeof toolArgs.station === 'string' && toolArgs.station.trim().length > 0
          ? toolArgs.station
          : 'Times Sq-42 St';
      const result = await mta.getSubwayStatus(
        station,
        toolArgs.line as string | undefined
      );
      return { result, cardType: 'subway_status' };
    }

    case 'get_weather': {
      const result = await weather.getWeather(
        toolArgs.latitude as number | undefined,
        toolArgs.longitude as number | undefined
      );
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
      const pickup =
        typeof toolArgs.pickup === 'string' && toolArgs.pickup.trim().length > 0
          ? toolArgs.pickup
          : 'Current location';
      const dropoff =
        typeof toolArgs.dropoff === 'string' && toolArgs.dropoff.trim().length > 0
          ? toolArgs.dropoff
          : 'Current location';
      const result = await uber.bookRide(
        pickup,
        dropoff,
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
      const pickupAddress = normalizeString(toolArgs.pickup_address);
      const dropoffAddress = normalizeString(toolArgs.dropoff_address);
      const items = normalizeString(toolArgs.items) || 'Package';

      if (!dropoffAddress || isLocationPlaceholder(dropoffAddress)) {
        throw new Error(
          'A valid dropoff address is required to create a DoorDash delivery.'
        );
      }

      if (!pickupAddress || isLocationPlaceholder(pickupAddress)) {
        throw new Error(
          'A valid pickup address is required. Share browser location or provide pickup_address explicitly.'
        );
      }

      const result = await doordash.createDelivery(
        pickupAddress,
        dropoffAddress,
        items
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
