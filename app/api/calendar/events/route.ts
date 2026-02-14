import { NextResponse } from 'next/server';
import { mockCalendarEvents } from '@/lib/mock-data';

export async function GET() {
  try {
    // Return mock calendar events
    return NextResponse.json(mockCalendarEvents);
  } catch (error) {
    console.error('Calendar events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
