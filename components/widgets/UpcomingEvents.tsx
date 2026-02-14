'use client';

import { Calendar } from 'lucide-react';
import type { CalendarEvent } from '@/lib/types';
import { formatTime } from '@/lib/utils/format';

interface UpcomingEventsProps {
  events: CalendarEvent[];
}

function getUrgencyBadge(datetime: string): { text: string; variant: 'amber' | 'emerald' | null } | null {
  const diff = new Date(datetime).getTime() - Date.now();
  const minutes = Math.round(diff / 60000);
  if (minutes <= 0) return { text: 'Now', variant: 'amber' };
  if (minutes <= 30) return { text: `In ${minutes} min`, variant: 'amber' };
  return null;
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-zinc-500" />
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Upcoming</span>
      </div>

      <div className="space-y-2.5">
        {events.length === 0 && (
          <p className="text-xs text-zinc-500">No upcoming events yet.</p>
        )}
        {events.map((event) => {
          const urgency = getUrgencyBadge(event.datetime);
          return (
            <div key={event.id} className="flex items-start gap-2.5">
              <div className="text-right shrink-0 w-14">
                <span className="font-mono text-xs text-zinc-400">
                  {formatTime(new Date(event.datetime))}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-zinc-200 truncate">{event.title}</span>
                  {urgency && (
                    <span className={`
                      shrink-0 text-[10px] font-mono rounded-full px-1.5 py-0.5
                      ${urgency.variant === 'amber'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }
                    `}>
                      {urgency.text}
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-600 truncate block">{event.location}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
