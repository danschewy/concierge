import type { Reservation } from '@/lib/types';
import { mockReservation } from '@/lib/mock-data';

/**
 * Resy reservation service (MOCK ONLY).
 *
 * In production, this would integrate with the Resy API
 * for restaurant discovery and reservation booking.
 * Currently returns mock data for demonstration purposes.
 */
export async function bookReservation(
  venueId: string,
  date: string,
  time: string,
  partySize: number
): Promise<Reservation> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  const confirmationCode = `RES-${Math.floor(10000 + Math.random() * 90000)}`;

  return {
    ...mockReservation,
    id: `res-${Date.now()}`,
    venue: venueId,
    date,
    time,
    partySize,
    confirmationCode,
    source: 'resy',
    status: 'confirmed',
  };
}
