import type { ErrandStatus } from '@/lib/types';
import { mockErrand } from '@/lib/mock-data';
import * as crypto from 'crypto';

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

export async function createDelivery(
  pickup: string,
  dropoff: string,
  items: string
): Promise<ErrandStatus> {
  if (!isDoorDashConfigured()) {
    console.warn('DoorDash credentials not set, using mock data');
    return {
      ...mockErrand,
      pickupAddress: pickup,
      dropoffAddress: dropoff,
      items,
    };
  }

  try {
    const externalDeliveryId = `gotham-${Date.now()}`;

    const response = await fetch(`${DOORDASH_API}/deliveries`, {
      method: 'POST',
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
      console.error(`DoorDash API error: ${response.status}`);
      return {
        ...mockErrand,
        pickupAddress: pickup,
        dropoffAddress: dropoff,
        items,
      };
    }

    const data = await response.json();

    return {
      id: data.external_delivery_id ?? externalDeliveryId,
      pickupAddress: data.pickup_address ?? pickup,
      dropoffAddress: data.dropoff_address ?? dropoff,
      items,
      dasherName: data.dasher_name ?? undefined,
      status: mapDoorDashStatus(data.delivery_status),
      etaMinutes: data.estimated_pickup_time
        ? Math.round(
            (new Date(data.estimated_pickup_time).getTime() - Date.now()) / 60000
          )
        : 35,
    };
  } catch (error) {
    console.error('Error creating DoorDash delivery:', error);
    return {
      ...mockErrand,
      pickupAddress: pickup,
      dropoffAddress: dropoff,
      items,
    };
  }
}

export async function getDeliveryStatus(id: string): Promise<ErrandStatus> {
  if (!isDoorDashConfigured()) {
    console.warn('DoorDash credentials not set, using mock data');
    return { ...mockErrand, id };
  }

  try {
    const response = await fetch(`${DOORDASH_API}/deliveries/${id}`, {
      method: 'GET',
      headers: getDoorDashHeaders(),
    });

    if (!response.ok) {
      console.error(`DoorDash API error: ${response.status}`);
      return { ...mockErrand, id };
    }

    const data = await response.json();

    return {
      id: data.external_delivery_id ?? id,
      pickupAddress: data.pickup_address ?? mockErrand.pickupAddress,
      dropoffAddress: data.dropoff_address ?? mockErrand.dropoffAddress,
      items: data.items?.[0]?.name ?? mockErrand.items,
      dasherName: data.dasher_name ?? undefined,
      status: mapDoorDashStatus(data.delivery_status),
      etaMinutes: data.estimated_pickup_time
        ? Math.round(
            (new Date(data.estimated_pickup_time).getTime() - Date.now()) / 60000
          )
        : mockErrand.etaMinutes,
    };
  } catch (error) {
    console.error('Error fetching DoorDash delivery status:', error);
    return { ...mockErrand, id };
  }
}

function mapDoorDashStatus(
  status?: string
): 'assigned' | 'picking_up' | 'en_route' | 'delivered' {
  switch (status) {
    case 'created':
    case 'confirmed':
      return 'assigned';
    case 'enroute_to_pickup':
    case 'arrived_at_pickup':
      return 'picking_up';
    case 'picked_up':
    case 'enroute_to_dropoff':
    case 'arrived_at_dropoff':
      return 'en_route';
    case 'delivered':
      return 'delivered';
    default:
      return 'assigned';
  }
}
