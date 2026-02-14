'use client';

import UpcomingEvents from '@/components/widgets/UpcomingEvents';
import FinancialHealth from '@/components/widgets/FinancialHealth';
import { mockCalendarEvents, mockFinancialSummary, mockMissionHistory } from '@/lib/mock-data';
import { relativeTime } from '@/lib/utils/format';

export default function LeftSidebar() {
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
      <UpcomingEvents events={mockCalendarEvents} />

      {/* Finances */}
      <FinancialHealth data={mockFinancialSummary} />

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
