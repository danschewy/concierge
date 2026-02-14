'use client';

import { useEffect, useMemo, useState } from 'react';
import UpcomingEvents from '@/components/widgets/UpcomingEvents';
import FinancialHealth from '@/components/widgets/FinancialHealth';
import { mockCalendarEvents, mockFinancialSummary, mockMissionHistory } from '@/lib/mock-data';
import { relativeTime } from '@/lib/utils/format';
import type { CalendarEvent, FinancialSummary } from '@/lib/types';

const SIDEBAR_REFRESH_MS = 60_000;

export default function LeftSidebar() {
  const [events, setEvents] = useState<CalendarEvent[]>(mockCalendarEvents);
  const [financialSummary, setFinancialSummary] =
    useState<FinancialSummary>(mockFinancialSummary);

  useEffect(() => {
    let isCancelled = false;

    const loadSidebarData = async () => {
      try {
        const [eventsResponse, financesResponse] = await Promise.all([
          fetch('/api/calendar/events', { cache: 'no-store' }),
          fetch('/api/plaid/transactions?period=week', { cache: 'no-store' }),
        ]);

        if (eventsResponse.ok) {
          const nextEvents = (await eventsResponse.json()) as CalendarEvent[];
          if (!isCancelled && Array.isArray(nextEvents)) {
            setEvents(nextEvents);
          }
        }

        if (financesResponse.ok) {
          const nextFinances = (await financesResponse.json()) as FinancialSummary;
          if (!isCancelled && nextFinances && Array.isArray(nextFinances.dailySpend)) {
            setFinancialSummary(nextFinances);
          }
        }
      } catch (error) {
        console.error('Failed to refresh sidebar data:', error);
      }
    };

    void loadSidebarData();
    const intervalId = window.setInterval(() => {
      void loadSidebarData();
    }, SIDEBAR_REFRESH_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((event) => !Number.isNaN(new Date(event.datetime).getTime()))
      .sort(
        (a, b) =>
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      )
      .slice(0, 3);
  }, [events]);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York',
  });

  return (
    <aside className="hidden lg:flex flex-col w-[280px] shrink-0 border-r border-[var(--border-default)] p-4 space-y-4 overflow-y-auto">
      {/* Greeting */}
      <div>
        <h2 className="text-base font-medium text-zinc-200">{greeting}, Dan</h2>
        <p className="text-xs text-zinc-600 mt-0.5">{dateStr}</p>
      </div>

      {/* Calendar */}
      <UpcomingEvents events={upcomingEvents} />

      {/* Finances */}
      <FinancialHealth data={financialSummary} />

      {/* Mission History */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-4">
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Mission History</span>
        <div className="mt-3 space-y-2">
          {mockMissionHistory.map((mission, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span>{mission.icon}</span>
              <span className="text-zinc-400 flex-1 truncate">{mission.summary}</span>
              <span className="font-mono text-zinc-600 shrink-0">{relativeTime(mission.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
