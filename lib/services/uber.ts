import type { AsyncTaskRef, RideStatus } from '@/lib/types';
import { mockRideStatus } from '@/lib/mock-data';
import {
  createLocalTaskRef,
  refreshLongTask,
  startLongTask,
} from '@/lib/services/blaxel';

const ROUTE_COORDINATES: [number, number][] = [
  [-73.9976, 40.7243],
  [-74.006, 40.7258],
  [-74.0099, 40.731],
  [-74.0089, 40.742],
  [-74.002, 40.756],
  [-73.987, 40.768],
  [-73.9835, 40.7725],
];

const DRIVER_PATH: [number, number][] = [
  [-74.006, 40.726],
  [-74.0052, 40.731],
  [-74.0038, 40.737],
  [-74.002, 40.742],
  [-73.998, 40.749],
  [-73.9915, 40.759],
  [-73.987, 40.768],
  [-73.9838, 40.7715],
];

const STAGE_WINDOWS_MS = {
  driver_assigned: 25_000,
  en_route: 55_000,
  arriving: 80_000,
};

const DEFAULT_FARE = '$24';

function pickVehicle(rideType?: string, existingVehicle?: string): string {
  if (existingVehicle && existingVehicle.trim().length > 0) {
    return existingVehicle;
  }
  if (rideType === 'UberXL') return 'White Chevrolet Suburban';
  if (rideType === 'UberBlack') return 'Black Mercedes S-Class';
  if (rideType === 'UberComfort') return 'Blue Tesla Model 3';
  return mockRideStatus.vehicle;
}

function getRideStartTime(rideId: string): number {
  const match = rideId.match(/^ride-(\d+)-/);
  if (!match) return Date.now();

  const timestamp = Number.parseInt(match[1], 10);
  return Number.isFinite(timestamp) ? timestamp : Date.now();
}

function getStatusByElapsed(
  elapsedMs: number
): RideStatus['status'] {
  if (elapsedMs < STAGE_WINDOWS_MS.driver_assigned) return 'driver_assigned';
  if (elapsedMs < STAGE_WINDOWS_MS.en_route) return 'en_route';
  if (elapsedMs < STAGE_WINDOWS_MS.arriving) return 'arriving';
  return 'complete';
}

function getEtaForStatus(status: RideStatus['status']): number {
  switch (status) {
    case 'driver_assigned':
      return 4;
    case 'en_route':
      return 3;
    case 'arriving':
      return 1;
    case 'complete':
      return 0;
    default:
      return 5;
  }
}

function getDriverLocation(elapsedMs: number): [number, number] {
  const clamped = Math.min(Math.max(elapsedMs, 0), STAGE_WINDOWS_MS.arriving);
  const ratio = clamped / STAGE_WINDOWS_MS.arriving;
  const index = Math.min(
    DRIVER_PATH.length - 1,
    Math.floor(ratio * DRIVER_PATH.length)
  );
  return DRIVER_PATH[index];
}

async function startMockRideDelayTask(
  rideId: string,
  pickup: string,
  dropoff: string,
  rideType?: string
): Promise<AsyncTaskRef> {
  const task = await startLongTask('mock_uber_delay', {
    ride_id: rideId,
    pickup,
    dropoff,
    ride_type: rideType ?? 'UberX',
    stage_schedule: [
      { status: 'driver_assigned', delay_seconds: 0 },
      { status: 'en_route', delay_seconds: 25 },
      { status: 'arriving', delay_seconds: 55 },
      { status: 'complete', delay_seconds: 80 },
    ],
  });

  return task ?? createLocalTaskRef('mock_uber_delay');
}

function buildMockRideSnapshot(input: {
  rideId: string;
  pickup: string;
  dropoff: string;
  rideType?: string;
  vehicle?: string;
  tracking?: AsyncTaskRef;
}): RideStatus {
  const rideStartedAt = getRideStartTime(input.rideId);
  const elapsedMs = Date.now() - rideStartedAt;
  const timelineStatus = getStatusByElapsed(elapsedMs);

  const status =
    input.tracking?.status === 'success'
      ? 'complete'
      : timelineStatus;
  const tracking =
    input.tracking?.provider === 'local' && status === 'complete'
      ? { ...input.tracking, status: 'success' as const }
      : input.tracking;

  return {
    ...mockRideStatus,
    id: input.rideId,
    pickup: input.pickup,
    dropoff: input.dropoff,
    vehicle: pickVehicle(input.rideType, input.vehicle),
    status,
    etaMinutes: getEtaForStatus(status),
    fare: DEFAULT_FARE,
    routeCoordinates: ROUTE_COORDINATES,
    driverLocation: getDriverLocation(elapsedMs),
    tracking,
  };
}

export async function bookRide(
  pickup: string,
  dropoff: string,
  rideType?: string
): Promise<RideStatus> {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const rideId = `ride-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  const tracking = await startMockRideDelayTask(rideId, pickup, dropoff, rideType);
  return buildMockRideSnapshot({
    rideId,
    pickup,
    dropoff,
    rideType,
    tracking,
  });
}

export async function getRideStatus(
  rideId: string,
  options?: {
    pickup?: string;
    dropoff?: string;
    rideType?: string;
    vehicle?: string;
    tracking?: AsyncTaskRef | null;
  }
): Promise<RideStatus> {
  const pickup = options?.pickup?.trim() || mockRideStatus.pickup;
  const dropoff = options?.dropoff?.trim() || mockRideStatus.dropoff;
  const rideType = options?.rideType;
  const vehicle = options?.vehicle;
  const tracking = options?.tracking
    ? await refreshLongTask(options.tracking)
    : undefined;

  return buildMockRideSnapshot({
    rideId,
    pickup,
    dropoff,
    rideType,
    vehicle,
    tracking,
  });
}
