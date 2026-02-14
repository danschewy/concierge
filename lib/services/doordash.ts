import type { ErrandStatus } from '@/lib/types';
import { mockErrand } from '@/lib/mock-data';
import * as crypto from 'crypto';
import type { AsyncTaskRef } from '@/lib/types';
import {
  createLocalTaskRef,
  refreshLongTask,
  startLongTask,
} from '@/lib/services/blaxel';

const DOORDASH_API = 'https://openapi.doordash.com/drive/v2';

function isDoorDashConfigured(): boolean {
  return !!(
    process.env.DOORDASH_DEVELOPER_ID &&
    process.env.DOORDASH_KEY_ID &&
    process.env.DOORDASH_SIGNING_SECRET
  );
}

function createDoorDashJWT(): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
    'dd-ver': 'DD-JWT-V1',
  };

  const payload = {
    aud: 'doordash',
    iss: process.env.DOORDASH_DEVELOPER_ID,
    kid: process.env.DOORDASH_KEY_ID,
    exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes
    iat: Math.floor(Date.now() / 1000),
  };

  const base64Header = Buffer.from(JSON.stringify(header))
    .toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload))
    .toString('base64url');

  const signingInput = `${base64Header}.${base64Payload}`;
  const secret = Buffer.from(
    process.env.DOORDASH_SIGNING_SECRET ?? '',
    'base64'
  );
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64url');

  return `${signingInput}.${signature}`;
}

function getDoorDashHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${createDoorDashJWT()}`,
  };
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function firstItemName(value: unknown): string | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const first = value[0];
  if (!first || typeof first !== 'object') return null;
  const maybeName = (first as Record<string, unknown>).name;
  return asString(maybeName);
}

function etaMinutesFromPickupTime(
  value: unknown,
  fallback: number
): number {
  const pickupTime = asString(value);
  if (!pickupTime) return fallback;

  const eta = Math.round((new Date(pickupTime).getTime() - Date.now()) / 60000);
  return Number.isFinite(eta) ? eta : fallback;
}

async function getErrorDetail(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.slice(0, 500);
  } catch {
    return '';
  }
}

function formatDoorDashErrorMessage(status: number, detail: string): string {
  return detail ? `DoorDash API error ${status}: ${detail}` : `DoorDash API error ${status}`;
}

async function startDeliveryWatchTask(
  deliveryId: string,
  pickupAddress: string,
  dropoffAddress: string,
  items: string
): Promise<AsyncTaskRef> {
  const task = await startLongTask('doordash_delivery_watch', {
    delivery_id: deliveryId,
    pickup_address: pickupAddress,
    dropoff_address: dropoffAddress,
    items,
    poll_interval_seconds: 30,
  });

  return task ?? createLocalTaskRef('doordash_delivery_watch');
}

async function withTracking(
  status: ErrandStatus,
  tracking?: AsyncTaskRef | null
): Promise<ErrandStatus> {
  if (!tracking) {
    return status;
  }

  const refreshed = await refreshLongTask(tracking);
  const finalizedTracking =
    refreshed.provider === 'local' && status.status === 'delivered'
      ? { ...refreshed, status: 'success' as const }
      : refreshed;

  return {
    ...status,
    tracking: finalizedTracking,
  };
}

export async function createDelivery(
  pickup: string,
  dropoff: string,
  items: string
): Promise<ErrandStatus> {
  const externalDeliveryId = `gotham-${Date.now()}`;

  if (!isDoorDashConfigured()) {
    console.warn('DoorDash credentials not set, using mock data');
    const tracking = await startDeliveryWatchTask(
      externalDeliveryId,
      pickup,
      dropoff,
      items
    );

    return withTracking({
      ...mockErrand,
      id: externalDeliveryId,
      pickupAddress: pickup,
      dropoffAddress: dropoff,
      items,
      source: 'mock',
    }, tracking);
  }

  try {
    const response = await fetch(`${DOORDASH_API}/deliveries`, {
      method: 'POST',
      cache: 'no-store',
      headers: getDoorDashHeaders(),
      body: JSON.stringify({
        external_delivery_id: externalDeliveryId,
        pickup_address: pickup,
        pickup_phone_number: '+12125551234',
        dropoff_address: dropoff,
        dropoff_phone_number: '+12125555678',
        order_value: 0, // For errands, value may not apply
        items: [
          {
            name: items,
            quantity: 1,
            external_id: 'item-1',
          },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await getErrorDetail(response);
      const message = formatDoorDashErrorMessage(response.status, detail);
      console.error(message);
      throw new Error(message);
    }

    const data = (await response.json()) as Record<string, unknown>;
    const id =
      typeof data.external_delivery_id === 'string'
        ? data.external_delivery_id
        : externalDeliveryId;
    const tracking = await startDeliveryWatchTask(id, pickup, dropoff, items);

    const delivery: ErrandStatus = {
      id,
      pickupAddress: asString(data.pickup_address) ?? pickup,
      dropoffAddress: asString(data.dropoff_address) ?? dropoff,
      items,
      dasherName: asString(data.dasher_name) ?? undefined,
      status: mapDoorDashStatus(asString(data.delivery_status) ?? undefined),
      etaMinutes: etaMinutesFromPickupTime(data.estimated_pickup_time, 35),
      source: 'live',
      doordashStatus: asString(data.delivery_status) ?? undefined,
      doordashSupportReference: asString(data.support_reference) ?? undefined,
      trackingUrl: asString(data.tracking_url) ?? undefined,
    };

    console.info(
      `DoorDash delivery created: id=${delivery.id} support_reference=${delivery.doordashSupportReference ?? 'n/a'}`
    );

    return withTracking(delivery, tracking);
  } catch (error) {
    console.error('Error creating DoorDash delivery:', error);
    if (!isDoorDashConfigured()) {
      const tracking = await startDeliveryWatchTask(
        externalDeliveryId,
        pickup,
        dropoff,
        items
      );
      return withTracking({
        ...mockErrand,
        id: externalDeliveryId,
        pickupAddress: pickup,
        dropoffAddress: dropoff,
        items,
        source: 'mock',
      }, tracking);
    }

    throw error;
  }
}

export async function getDeliveryStatus(
  id: string,
  tracking?: AsyncTaskRef | null
): Promise<ErrandStatus> {
  if (!isDoorDashConfigured()) {
    console.warn('DoorDash credentials not set, using mock data');
    return withTracking({ ...mockErrand, id, source: 'mock' }, tracking);
  }

  try {
    const response = await fetch(`${DOORDASH_API}/deliveries/${id}`, {
      method: 'GET',
      cache: 'no-store',
      headers: getDoorDashHeaders(),
    });

    if (!response.ok) {
      const detail = await getErrorDetail(response);
      const message = formatDoorDashErrorMessage(response.status, detail);
      console.error(message);
      throw new Error(message);
    }

    const data = (await response.json()) as Record<string, unknown>;
    const nextId = asString(data.external_delivery_id) ?? id;

    return withTracking({
      id: nextId,
      pickupAddress: asString(data.pickup_address) ?? mockErrand.pickupAddress,
      dropoffAddress: asString(data.dropoff_address) ?? mockErrand.dropoffAddress,
      items: firstItemName(data.items) ?? mockErrand.items,
      dasherName: asString(data.dasher_name) ?? undefined,
      status: mapDoorDashStatus(asString(data.delivery_status) ?? undefined),
      etaMinutes: etaMinutesFromPickupTime(
        data.estimated_pickup_time,
        mockErrand.etaMinutes
      ),
      source: 'live',
      doordashStatus: asString(data.delivery_status) ?? undefined,
      doordashSupportReference: asString(data.support_reference) ?? undefined,
      trackingUrl: asString(data.tracking_url) ?? undefined,
    }, tracking);
  } catch (error) {
    console.error('Error fetching DoorDash delivery status:', error);
    if (!isDoorDashConfigured()) {
      return withTracking({ ...mockErrand, id, source: 'mock' }, tracking);
    }
    throw error;
  }
}

function mapDoorDashStatus(
  status?: string
): 'assigned' | 'picking_up' | 'en_route' | 'delivered' {
  switch (status) {
    case 'created':
    case 'confirmed':
    case 'assigned':
    case 'dasher_assigned':
    case 'dasher_confirmed':
      return 'assigned';
    case 'enroute_to_pickup':
    case 'arrived_at_pickup':
      return 'picking_up';
    case 'picked_up':
    case 'enroute_to_dropoff':
    case 'arrived_at_dropoff':
      return 'en_route';
    case 'delivered':
    case 'delivery_completed':
    case 'completed':
    case 'dropped_off':
    case 'dropoff_complete':
      return 'delivered';
    default:
      return 'assigned';
  }
}
