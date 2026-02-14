import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, datetime, location } = body;

    if (!title || !datetime) {
      return NextResponse.json(
        { error: 'title and datetime are required' },
        { status: 400 }
      );
    }

    // Mock created calendar event
    const event = {
      id: `cal-${Date.now()}`,
      title,
      datetime,
      location: location || '',
      duration: 60,
      status: 'confirmed',
      calendarLink: `https://calendar.google.com/calendar/event?eid=${Date.now()}`,
    };

    return NextResponse.json(event);
  } catch (error) {
    console.error('Calendar create error:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
