import { NextResponse } from 'next/server';
import { mockEvents } from '@/lib/mock-data';

export async function GET() {
  try {
    // Mock SeatGeek events - returns same mock events with SeatGeek branding
    const seatgeekEvents = mockEvents.map((event) => ({
      ...event,
      source: 'seatgeek',
      url: 'https://www.seatgeek.com',
    }));

    return NextResponse.json(seatgeekEvents);
  } catch (error) {
    console.error('SeatGeek events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SeatGeek events' },
      { status: 500 }
    );
  }
}
