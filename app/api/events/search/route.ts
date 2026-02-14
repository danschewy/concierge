import { NextResponse } from 'next/server';
import * as ticketmaster from '@/lib/services/ticketmaster';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const date = searchParams.get('date') || undefined;
    const category = searchParams.get('category') || undefined;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const events = await ticketmaster.searchEvents(query, date, category);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Event search error:', error);
    return NextResponse.json(
      { error: 'Failed to search events' },
      { status: 500 }
    );
  }
}
