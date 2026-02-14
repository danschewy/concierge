import type { EventListing } from '@/lib/types';
import { mockEvents } from '@/lib/mock-data';

const TICKETMASTER_API = 'https://app.ticketmaster.com/discovery/v2/events.json';

interface TicketmasterEvent {
  id: string;
  name: string;
  dates?: {
    start?: {
      localDate?: string;
      localTime?: string;
    };
  };
  priceRanges?: Array<{
    min?: number;
    max?: number;
    currency?: string;
  }>;
  _embedded?: {
    venues?: Array<{
      name?: string;
    }>;
  };
  classifications?: Array<{
    segment?: { name?: string };
    genre?: { name?: string };
  }>;
  url?: string;
  images?: Array<{
    url?: string;
    ratio?: string;
    width?: number;
  }>;
  dates_status?: {
    code?: string;
  };
}

function formatDate(localDate?: string): string {
  if (!localDate) return 'TBD';
  try {
    const date = new Date(localDate + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return localDate;
  }
}

function formatTime(localTime?: string): string {
  if (!localTime) return 'TBD';
  try {
    const [hours, minutes] = localTime.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
  } catch {
    return localTime;
  }
}

function formatPriceRange(
  priceRanges?: Array<{ min?: number; max?: number; currency?: string }>
): string {
  if (!priceRanges || priceRanges.length === 0) return 'See website';
  const range = priceRanges[0];
  if (range.min && range.max) {
    return `$${Math.round(range.min)} - $${Math.round(range.max)}`;
  }
  if (range.min) return `From $${Math.round(range.min)}`;
  if (range.max) return `Up to $${Math.round(range.max)}`;
  return 'See website';
}

function determineAvailability(
  event: TicketmasterEvent
): 'available' | 'limited' | 'sold_out' {
  const statusCode = event.dates_status?.code;
  if (statusCode === 'offsale' || statusCode === 'cancelled') return 'sold_out';
  if (statusCode === 'rescheduled') return 'limited';
  return 'available';
}

function mapToEventListing(event: TicketmasterEvent): EventListing {
  const venue = event._embedded?.venues?.[0]?.name ?? 'Venue TBD';
  const genre =
    event.classifications?.[0]?.genre?.name ??
    event.classifications?.[0]?.segment?.name ??
    'General';
  const image = event.images?.find((img) => img.ratio === '16_9') ?? event.images?.[0];

  return {
    id: event.id,
    name: event.name,
    venue,
    date: formatDate(event.dates?.start?.localDate),
    time: formatTime(event.dates?.start?.localTime),
    priceRange: formatPriceRange(event.priceRanges),
    availability: determineAvailability(event),
    genre,
    url: event.url ?? 'https://www.ticketmaster.com',
    imageUrl: image?.url,
  };
}

export async function searchEvents(
  query: string,
  date?: string,
  category?: string
): Promise<EventListing[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    console.warn('TICKETMASTER_API_KEY not set, using mock data');
    return mockEvents;
  }

  try {
    const params = new URLSearchParams({
      apikey: apiKey,
      keyword: query,
      size: '10',
      sort: 'date,asc',
      city: 'New York',
      stateCode: 'NY',
    });

    if (date) {
      // Accept date as YYYY-MM-DD and convert to Ticketmaster format
      params.set('startDateTime', `${date}T00:00:00Z`);
      params.set('endDateTime', `${date}T23:59:59Z`);
    }

    if (category) {
      // Map common category names to Ticketmaster segment names
      const categoryMap: Record<string, string> = {
        sports: 'Sports',
        music: 'Music',
        theater: 'Arts & Theatre',
        theatre: 'Arts & Theatre',
        comedy: 'Arts & Theatre',
        film: 'Film',
      };
      const segmentName = categoryMap[category.toLowerCase()] ?? category;
      params.set('segmentName', segmentName);
    }

    const response = await fetch(`${TICKETMASTER_API}?${params.toString()}`);

    if (!response.ok) {
      console.error(`Ticketmaster API error: ${response.status}`);
      return mockEvents;
    }

    const data = await response.json();
    const events: TicketmasterEvent[] = data._embedded?.events ?? [];

    if (events.length === 0) {
      return mockEvents;
    }

    return events.map(mapToEventListing);
  } catch (error) {
    console.error('Error fetching Ticketmaster events:', error);
    return mockEvents;
  }
}
