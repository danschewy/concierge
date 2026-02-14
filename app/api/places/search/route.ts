import { NextResponse } from 'next/server';
import * as places from '@/lib/services/places';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const location = searchParams.get('location') || undefined;
    const price_level = searchParams.get('price_level')
      ? parseInt(searchParams.get('price_level')!, 10)
      : undefined;
    const open_now = searchParams.get('open_now') === 'true' ? true : undefined;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const restaurants = await places.searchRestaurants(query, location, price_level, open_now);
    return NextResponse.json(restaurants);
  } catch (error) {
    console.error('Places search error:', error);
    return NextResponse.json(
      { error: 'Failed to search restaurants' },
      { status: 500 }
    );
  }
}
