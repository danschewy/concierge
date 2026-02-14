import { NextResponse } from 'next/server';
import * as uber from '@/lib/services/uber';
import { parseTrackingQuery } from '@/lib/utils/tracking';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const { searchParams } = new URL(request.url);
    const tracking = parseTrackingQuery(searchParams);
    const pickup = searchParams.get('pickup') ?? undefined;
    const dropoff = searchParams.get('dropoff') ?? undefined;
    const rideType = searchParams.get('ride_type') ?? undefined;
    const vehicle = searchParams.get('vehicle') ?? undefined;

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    const status = await uber.getRideStatus(tripId, {
      pickup,
      dropoff,
      rideType,
      vehicle,
      tracking,
    });

    return NextResponse.json(status);
  } catch (error) {
    console.error('Uber status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ride status' },
      { status: 500 }
    );
  }
}
