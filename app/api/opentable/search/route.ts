import { NextResponse } from 'next/server';
import { mockRestaurants } from '@/lib/mock-data';

export async function GET() {
  try {
    // Mock OpenTable restaurant search with availability
    const restaurants = mockRestaurants.map((restaurant) => ({
      ...restaurant,
      source: 'opentable',
      availableSlots: [
        { time: '5:30 PM', covers: 4 },
        { time: '6:45 PM', covers: 2 },
        { time: '8:00 PM', covers: 6 },
        { time: '9:30 PM', covers: 2 },
      ],
      dinerPoints: 100,
      reviewCount: 1247,
    }));

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error('OpenTable search error:', error);
    return NextResponse.json(
      { error: 'Failed to search OpenTable restaurants' },
      { status: 500 }
    );
  }
}
