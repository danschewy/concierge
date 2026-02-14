import type { EventListing } from '@/lib/types';
import { mockEvents } from '@/lib/mock-data';

/**
 * SeatGeek event search service (MOCK ONLY).
 *
 * In production, this would integrate with the SeatGeek API
 * for event discovery and ticket purchasing.
 * Currently returns mock data for demonstration purposes.
 */
export async function searchEvents(query: string): Promise<EventListing[]> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Filter mock events by query if a search term is provided
  if (query) {
    const lowerQuery = query.toLowerCase();
    const filtered = mockEvents.filter(
      (event) =>
        event.name.toLowerCase().includes(lowerQuery) ||
        event.venue.toLowerCase().includes(lowerQuery) ||
        event.genre.toLowerCase().includes(lowerQuery)
    );
    return filtered.length > 0 ? filtered : mockEvents;
  }

  return mockEvents;
}
