import { NextResponse } from 'next/server';
import * as calendar from '@/lib/services/calendar';

export async function GET() {
  try {
    const events = await calendar.getCalendarEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Calendar events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
