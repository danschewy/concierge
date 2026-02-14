import { NextResponse } from 'next/server';
import * as blaxel from '@/lib/services/blaxel';
import { parseTrackingQuery } from '@/lib/utils/tracking';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tracking = parseTrackingQuery(searchParams);

    if (tracking) {
      const status = await blaxel.refreshLongTask(tracking);
      return NextResponse.json(status);
    }

    const status = await blaxel.getAgentStatus('default');
    return NextResponse.json(status);
  } catch (error) {
    console.error('Agent status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent status' },
      { status: 500 }
    );
  }
}
