import { NextResponse } from 'next/server';
import * as doordash from '@/lib/services/doordash';
import { parseTrackingQuery } from '@/lib/utils/tracking';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tracking = parseTrackingQuery(searchParams);

    if (!id) {
      return NextResponse.json(
        { error: 'Delivery ID is required' },
        { status: 400 }
      );
    }

    const status = await doordash.getDeliveryStatus(id, tracking);
    return NextResponse.json(status);
  } catch (error) {
    console.error('DoorDash status error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch delivery status';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
