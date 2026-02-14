export type BookingProvider = 'resy' | 'opentable';

export interface BookingUrlOptions {
  venue: string;
  address?: string;
  date?: string;
  time?: string;
  partySize?: number;
}

interface BookingRedirectOptions extends BookingUrlOptions {
  provider: BookingProvider;
}

function buildQuery(options: BookingUrlOptions): string {
  return [options.venue, options.address].filter(Boolean).join(' ').trim();
}

const VENUE_ALIASES: Record<string, string> = {
  'rest-1': 'Carbone',
  'rest-2': "Xi'an Famous Foods",
  'rest-3': 'Balthazar',
};

export function resolveVenueLabel(venue: string): string {
  const trimmed = venue.trim();
  if (!trimmed) return venue;

  const alias = VENUE_ALIASES[trimmed.toLowerCase()];
  return alias || trimmed;
}

function toUtcIsoDate(date: string): string | null {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function toOpenTableDateTime(date?: string, time?: string): string | null {
  if (!date) return null;

  const isoDate = toUtcIsoDate(date) || date;
  if (!time) return isoDate;
  return `${isoDate} ${time}`;
}

export function buildResySearchUrl(options: BookingUrlOptions): string {
  const url = new URL('https://resy.com/cities/new-york-ny/search');
  const query = buildQuery(options);
  if (query) {
    url.searchParams.set('query', query);
  }
  if (options.date) {
    url.searchParams.set('date', options.date);
  }
  if (options.time) {
    url.searchParams.set('time', options.time);
  }
  if (typeof options.partySize === 'number' && Number.isFinite(options.partySize)) {
    url.searchParams.set('seats', String(options.partySize));
  }
  return url.toString();
}

export function buildOpenTableSearchUrl(options: BookingUrlOptions): string {
  const url = new URL('https://www.opentable.com/s/');
  const query = buildQuery(options);
  if (query) {
    url.searchParams.set('term', query);
  }
  if (typeof options.partySize === 'number' && Number.isFinite(options.partySize)) {
    url.searchParams.set('covers', String(options.partySize));
  }
  const dateTime = toOpenTableDateTime(options.date, options.time);
  if (dateTime) {
    url.searchParams.set('dateTime', dateTime);
  }
  return url.toString();
}

export function buildBookingRedirectUrl(options: BookingRedirectOptions): string {
  const venue = resolveVenueLabel(options.venue);
  const params = new URLSearchParams({
    provider: options.provider,
    venue,
  });

  if (options.address) params.set('address', options.address);
  if (options.date) params.set('date', options.date);
  if (options.time) params.set('time', options.time);
  if (typeof options.partySize === 'number' && Number.isFinite(options.partySize)) {
    params.set('partySize', String(options.partySize));
  }

  return `/api/booking/redirect?${params.toString()}`;
}
