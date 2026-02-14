import type { CalendarEvent } from '@/lib/types';
import { mockCalendarEvents } from '@/lib/mock-data';

/**
 * Calendar service (MOCK ONLY).
 *
 * In production, this would integrate with Google Calendar
 * or another calendar provider via OAuth.
 * Currently returns mock data for demonstration purposes.
 */
export async function getCalendarEvents(
  count?: number
): Promise<CalendarEvent[]> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 200));

  const events = [...mockCalendarEvents]
    .sort(
      (a, b) =>
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );

  if (count && count > 0) {
    return events.slice(0, count);
  }

  return events;
}

export async function addCalendarEvent(
  title: string,
  datetime: string,
  location: string
): Promise<CalendarEvent> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newEvent: CalendarEvent = {
    id: `cal-${Date.now()}`,
    title,
    datetime,
    location,
    duration: 60, // Default 1 hour
  };

  return newEvent;
}
