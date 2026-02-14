import { NextResponse } from 'next/server';
import * as citibike from '@/lib/services/citibike';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('latitude') || '');
    const longitude = parseFloat(searchParams.get('longitude') || '');

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Valid latitude and longitude parameters are required' },
        { status: 400 }
      );
    }

    const availability = await citibike.getBikeAvailability(latitude, longitude);
    return NextResponse.json(availability);
  } catch (error) {
    console.error('Bike availability error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bike availability' },
      { status: 500 }
    );
  }
}
