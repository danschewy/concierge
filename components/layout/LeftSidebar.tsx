'use client';

import { useEffect, useMemo, useState } from 'react';
import UpcomingEvents from '@/components/widgets/UpcomingEvents';
import FinancialHealth from '@/components/widgets/FinancialHealth';
import type { CalendarEvent, FinancialSummary, MissionHistoryItem } from '@/lib/types';
import { relativeTime } from '@/lib/utils/format';
import {
  getMissionHistory,
  MISSION_HISTORY_UPDATED_EVENT,
} from '@/lib/utils/mission-history';

const SIDEBAR_REFRESH_MS = 60_000;

export default function LeftSidebar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [financialSummary, setFinancialSummary] =
    useState<FinancialSummary | null>(null);
  const [missionHistory, setMissionHistory] = useState<MissionHistoryItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

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
      } finally {
        if (!isCancelled) {
          setHasLoaded(true);
        }
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncMissionHistory = () => {
      setMissionHistory(getMissionHistory());
    };

    const handleStorageUpdate = () => {
      syncMissionHistory();
    };

    syncMissionHistory();
    window.addEventListener(MISSION_HISTORY_UPDATED_EVENT, handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener(MISSION_HISTORY_UPDATED_EVENT, handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

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
      {financialSummary ? (
        <FinancialHealth data={financialSummary} />
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-4">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Finances</span>
          <p className="text-xs text-zinc-500 mt-3">
            {hasLoaded ? 'Financial data unavailable right now.' : 'Loading live financial data...'}
          </p>
        </div>
      )}

      {/* Mission History */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-4">
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Mission History</span>
        {missionHistory.length === 0 ? (
          <p className="text-xs text-zinc-500 mt-3">
            Completed missions will appear here after your first run.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {missionHistory.slice(0, 5).map((mission) => {
              const completedAt = new Date(mission.completedAt);
              const timeLabel = Number.isNaN(completedAt.getTime())
                ? 'just now'
                : relativeTime(completedAt);

              return (
                <div
                  key={mission.id}
                  className="rounded-md border border-[var(--border-default)] bg-zinc-900/30 px-2.5 py-2"
                >
                  <p className="text-xs text-zinc-200">{mission.summary}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                      {mission.command}
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      Completed {timeLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
