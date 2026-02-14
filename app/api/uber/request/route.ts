import { NextResponse } from 'next/server';
import * as uber from '@/lib/services/uber';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pickup, dropoff, ride_type } = body;

    if (!pickup || !dropoff) {
      return NextResponse.json(
        { error: 'pickup and dropoff are required' },
        { status: 400 }
      );
    }

    const ride = await uber.bookRide(
      pickup,
      dropoff,
      typeof ride_type === 'string' ? ride_type : undefined
    );

    return NextResponse.json(ride);
  } catch (error) {
    console.error('Uber request error:', error);
    return NextResponse.json(
      { error: 'Failed to request ride' },
      { status: 500 }
    );
  }
}
