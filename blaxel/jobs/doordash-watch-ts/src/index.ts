import * as crypto from 'crypto';
import { blStartJob } from '@blaxel/core';
import { blaxelTelemetry } from '@blaxel/telemetry';

const DOORDASH_API = 'https://openapi.doordash.com/drive/v2';

type JobArguments = {
  delivery_id: string;
  poll_interval_seconds?: number;
  max_polls?: number;
};

type DoorDashStatus =
  | 'created'
  | 'confirmed'
  | 'enroute_to_pickup'
  | 'arrived_at_pickup'
  | 'picked_up'
  | 'enroute_to_dropoff'
  | 'arrived_at_dropoff'
  | 'delivered'
  | 'cancelled'
  | string;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasDoorDashCredentials(): boolean {
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
    exp: Math.floor(Date.now() / 1000) + 300,
    iat: Math.floor(Date.now() / 1000),
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = `${base64Header}.${base64Payload}`;

  const secret = Buffer.from(process.env.DOORDASH_SIGNING_SECRET ?? '', 'base64');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64url');

  return `${signingInput}.${signature}`;
}

async function fetchDoorDashStatus(deliveryId: string): Promise<DoorDashStatus | null> {
  if (!hasDoorDashCredentials()) {
    return null;
  }

  const response = await fetch(`${DOORDASH_API}/deliveries/${deliveryId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${createDoorDashJWT()}`,
    },
  });

  if (!response.ok) {
    console.log(`[doordash-watch] API status ${response.status} for ${deliveryId}`);
    return null;
  }

  const payload = (await response.json()) as { delivery_status?: string };
  return payload.delivery_status ?? null;
}

function isTerminalStatus(status: DoorDashStatus | null): boolean {
  return status === 'delivered' || status === 'cancelled';
}

async function doordashDeliveryWatchJob({
  delivery_id,
  poll_interval_seconds = 30,
  max_polls = 40,
}: JobArguments) {
  return blaxelTelemetry.tracer.startActiveSpan(
    'doordashDeliveryWatchJob',
    {
      attributes: {
        'job.name': 'doordashDeliveryWatchJob',
        'job.delivery_id': delivery_id,
      },
      root: true,
    },
    async (span) => {
      let lastStatus: DoorDashStatus | null = null;

      for (let i = 0; i < max_polls; i += 1) {
        lastStatus = await fetchDoorDashStatus(delivery_id);
        const attempt = i + 1;

        if (lastStatus) {
          console.log(
            `[doordash-watch] ${delivery_id} attempt ${attempt}/${max_polls}: ${lastStatus}`
          );
        } else {
          console.log(
            `[doordash-watch] ${delivery_id} attempt ${attempt}/${max_polls}: no status`
          );
        }

        if (isTerminalStatus(lastStatus)) {
          span.setAttribute('job.terminal_status', lastStatus ?? 'unknown');
          span.setAttribute('job.attempts', attempt);
          span.end();
          return;
        }

        await sleep(poll_interval_seconds * 1000);
      }

      span.setAttribute('job.terminal_status', lastStatus ?? 'unknown');
      span.setAttribute('job.attempts', max_polls);
      span.end();
      return;
    }
  );
}

blStartJob(doordashDeliveryWatchJob);
