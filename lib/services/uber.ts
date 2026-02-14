import type { RideStatus } from '@/lib/types';
import { mockRideStatus } from '@/lib/mock-data';

/**
 * Uber ride service (MOCK ONLY).
 *
 * In production, this would integrate with the Uber API.
 * Currently returns mock data for demonstration purposes.
 */
export async function bookRide(
  pickup: string,
  dropoff: string,
  rideType?: string
): Promise<RideStatus> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    ...mockRideStatus,
    id: `ride-${Date.now()}`,
    pickup,
    dropoff,
    status: 'driver_assigned',
    vehicle: rideType === 'UberXL'
      ? 'White Chevrolet Suburban'
      : rideType === 'UberBlack'
        ? 'Black Mercedes S-Class'
        : mockRideStatus.vehicle,
  };
}
