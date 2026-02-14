import { NextResponse } from 'next/server';
import { mockRestaurants } from '@/lib/mock-data';

export async function GET() {
  try {
    // Mock Resy restaurant search with availability
    const restaurants = mockRestaurants.map((restaurant) => ({
      ...restaurant,
      source: 'resy',
      availableSlots: [
        { time: '6:00 PM', type: 'Dining Room' },
        { time: '7:30 PM', type: 'Dining Room' },
        { time: '8:00 PM', type: 'Bar' },
        { time: '9:15 PM', type: 'Dining Room' },
      ],
      acceptsWalkIns: false,
    }));

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error('Resy search error:', error);
    return NextResponse.json(
      { error: 'Failed to search Resy restaurants' },
      { status: 500 }
    );
  }
}
