import { NextResponse } from 'next/server';
import { searchWeb } from '@/lib/services/tavily';
import {
  buildOpenTableSearchUrl,
  buildResySearchUrl,
  resolveVenueLabel,
  type BookingProvider,
  type BookingUrlOptions,
} from '@/lib/utils/booking-urls';

const KNOWN_BOOKING_URLS: Record<BookingProvider, Record<string, string>> = {
  resy: {
    carbone: 'https://resy.com/cities/new-york-ny/venues/carbone',
    balthazar: 'https://resy.com/cities/new-york-ny/venues/balthazar',
  },
  opentable: {
    carbone: 'https://www.opentable.com/r/carbone-new-york',
    balthazar: 'https://www.opentable.com/r/balthazar-new-york',
  },
};

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value: string): string {
  return normalizeName(value).replace(/\s+/g, '-');
}

function isProvider(provider: string | null): provider is BookingProvider {
  return provider === 'resy' || provider === 'opentable';
}

function buildFallbackUrl(provider: BookingProvider, options: BookingUrlOptions): string {
  return provider === 'resy'
    ? buildResySearchUrl(options)
    : buildOpenTableSearchUrl(options);
}

function knownBookingUrl(provider: BookingProvider, venue: string): string | null {
  const key = normalizeName(venue);
  return KNOWN_BOOKING_URLS[provider][key] || null;
}

function buildDirectCandidates(provider: BookingProvider, venue: string): string[] {
  const slug = slugify(venue);
  if (!slug) return [];

  if (provider === 'resy') {
    return [
      `https://resy.com/cities/new-york-ny/venues/${slug}`,
    ];
  }

  return [
    `https://www.opentable.com/r/${slug}-new-york`,
    `https://www.opentable.com/r/${slug}`,
    `https://www.opentable.com/${slug}`,
  ];
}

function isLikelyDirectUrl(provider: BookingProvider, rawUrl: string): boolean {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }

  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();

  if (provider === 'resy') {
    if (!host.includes('resy.com')) return false;
    return path.includes('/venues/') && !path.includes('/search');
  }

  if (!host.includes('opentable.com')) return false;
  if (path.startsWith('/s/')) return false;
  return path.startsWith('/r/') || (path.length > 1 && !path.startsWith('/search'));
}

function dedupe(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

async function findProviderUrlFromSearch(
  provider: BookingProvider,
  options: BookingUrlOptions
): Promise<string | null> {
  try {
    const providerDomain = provider === 'resy' ? 'resy.com' : 'opentable.com';
    const searchQuery = `site:${providerDomain} "${options.venue}" "${options.address || 'New York'}"`;
    const results = await searchWeb(searchQuery);
    const match = results.find((result) => isLikelyDirectUrl(provider, result.url));
    return match?.url || null;
  } catch {
    return null;
  }
}

async function firstReachableUrl(candidates: string[]): Promise<string | null> {
  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, {
        method: 'GET',
        redirect: 'follow',
        cache: 'no-store',
      });

      if (response.ok) {
        return response.url || candidate;
      }

      // Some providers may block bot-like traffic even for valid pages.
      if (response.status === 401 || response.status === 403) {
        return candidate;
      }
    } catch {
      // Try next candidate.
    }
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const providerParam = searchParams.get('provider');
  const venue = searchParams.get('venue');
  const address = searchParams.get('address') || undefined;
  const date = searchParams.get('date') || undefined;
  const time = searchParams.get('time') || undefined;
  const partySizeRaw = searchParams.get('partySize');
  const partySize = partySizeRaw ? Number.parseInt(partySizeRaw, 10) : undefined;

  if (!isProvider(providerParam) || !venue) {
    return NextResponse.json(
      { error: 'provider and venue are required' },
      { status: 400 }
    );
  }

  const bookingOptions: BookingUrlOptions = {
    venue: resolveVenueLabel(venue),
    address,
    date,
    time,
    partySize: Number.isFinite(partySize) ? partySize : undefined,
  };

  const fallbackUrl = buildFallbackUrl(providerParam, bookingOptions);
  const knownUrl = knownBookingUrl(providerParam, bookingOptions.venue);
  if (knownUrl) {
    return NextResponse.redirect(knownUrl, 307);
  }

  const searchResolvedUrl = await findProviderUrlFromSearch(providerParam, bookingOptions);
  if (searchResolvedUrl) {
    return NextResponse.redirect(searchResolvedUrl, 307);
  }

  const directCandidate = await firstReachableUrl(
    dedupe(buildDirectCandidates(providerParam, bookingOptions.venue))
  );
  if (directCandidate) {
    return NextResponse.redirect(directCandidate, 307);
  }

  return NextResponse.redirect(fallbackUrl, 307);
}
