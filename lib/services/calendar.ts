import type { CalendarEvent } from '@/lib/types';

interface CalendarTemplate {
  id: string;
  title: string;
  offsetMinutes: number;
  location: string;
  duration: number;
}

const MOCK_CALENDAR_TEMPLATES: CalendarTemplate[] = [
  {
    id: 'cal-1',
    title: 'Hackathon Demo',
    offsetMinutes: 25,
    location: 'David Geffen Hall',
    duration: 120,
  },
  {
    id: 'cal-2',
    title: 'Dinner with Sarah',
    offsetMinutes: 5 * 60,
    location: 'Carbone, 181 Thompson St',
    duration: 90,
  },
  {
    id: 'cal-3',
    title: 'Morning Standup',
    offsetMinutes: 18 * 60,
    location: 'Zoom',
    duration: 30,
  },
];

function buildMockCalendarEvents(): CalendarEvent[] {
  const now = Date.now();

  return MOCK_CALENDAR_TEMPLATES.map((template) => ({
    id: template.id,
    title: template.title,
    datetime: new Date(now + template.offsetMinutes * 60000).toISOString(),
    location: template.location,
    duration: template.duration,
  }));
}

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

  const events = buildMockCalendarEvents()
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
