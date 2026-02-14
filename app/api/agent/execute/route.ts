import { NextResponse } from 'next/server';
import * as blaxel from '@/lib/services/blaxel';
import type { AsyncTaskKind } from '@/lib/types';

const VALID_KINDS: AsyncTaskKind[] = ['doordash_delivery_watch', 'mock_uber_delay'];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      task?: string;
      kind?: unknown;
      payload?: unknown;
    };

    const kind = typeof body.kind === 'string' ? body.kind : null;
    const payload =
      body.payload && typeof body.payload === 'object'
        ? (body.payload as Record<string, unknown>)
        : null;

    if (kind && payload && VALID_KINDS.includes(kind as AsyncTaskKind)) {
      const result =
        (await blaxel.startLongTask(kind as AsyncTaskKind, payload)) ??
        blaxel.createLocalTaskRef(kind as AsyncTaskKind);
      return NextResponse.json(result);
    }

    if (typeof body.task === 'string' && body.task.trim().length > 0) {
      const result = await blaxel.executeAgent(body.task);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Provide either { task } or { kind, payload }' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Agent execute error:', error);
    return NextResponse.json(
      { error: 'Failed to execute agent' },
      { status: 500 }
    );
  }
}
