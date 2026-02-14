import { NextResponse } from 'next/server';
import * as doordash from '@/lib/services/doordash';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pickup_address, dropoff_address, items } = body;

    if (!pickup_address || !dropoff_address || !items) {
      return NextResponse.json(
        { error: 'pickup_address, dropoff_address, and items are required' },
        { status: 400 }
      );
    }

    const delivery = await doordash.createDelivery(pickup_address, dropoff_address, items);
    return NextResponse.json(delivery);
  } catch (error) {
    console.error('DoorDash delivery error:', error);
    return NextResponse.json(
      { error: 'Failed to create delivery' },
      { status: 500 }
    );
  }
}
