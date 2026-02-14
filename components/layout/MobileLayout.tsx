'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatTime } from '@/lib/utils/format';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import LiveMap from '@/components/widgets/LiveMap';
import { COOL_TEST_MESSAGE } from '@/lib/constants/prompts';
import type { CalendarEvent, FinancialSummary } from '@/lib/types';

const MOBILE_REFRESH_MS = 60_000;

interface MobileHeaderProps {
  onQuickAction: (text: string) => void;
}

export function MobileTopBar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadMobileData = async () => {
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
        console.error('Failed to refresh mobile top bar:', error);
      }
    };

    void loadMobileData();
    const intervalId = window.setInterval(() => {
      void loadMobileData();
    }, MOBILE_REFRESH_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const nextEvent = useMemo(() => {
    return [...events]
      .filter((event) => !Number.isNaN(new Date(event.datetime).getTime()))
      .sort(
        (a, b) =>
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      )[0] ?? null;
  }, [events]);

  const remaining = financialSummary
    ? financialSummary.weeklyBudget - financialSummary.weeklySpend
    : null;
  const percentUsed = financialSummary && financialSummary.weeklyBudget > 0
    ? Math.round((financialSummary.weeklySpend / financialSummary.weeklyBudget) * 100)
    : 0;
  const barColor = percentUsed < 50 ? 'bg-emerald-500' : percentUsed < 80 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="lg:hidden flex gap-2 px-3 py-2 overflow-x-auto border-b border-[var(--border-default)]">
      {/* Next event pill */}
      {nextEvent && (
        <div className="shrink-0 flex items-center gap-2 bg-zinc-900 border border-[var(--border-default)] rounded-full px-3 py-1.5">
          <span className="text-xs">📅</span>
          <span className="text-xs text-zinc-300 truncate max-w-[120px]">{nextEvent.title}</span>
          <span className="font-mono text-[10px] text-amber-400">
            {formatTime(new Date(nextEvent.datetime))}
          </span>
        </div>
      )}

      {/* Budget pill */}
      <div className="shrink-0 flex items-center gap-2 bg-zinc-900 border border-[var(--border-default)] rounded-full px-3 py-1.5">
        <span className="text-xs">💰</span>
        <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percentUsed}%` }} />
        </div>
        <span className="font-mono text-[10px] text-zinc-400">
          {remaining === null ? 'Live' : `$${Math.round(remaining)}`}
        </span>
      </div>
    </div>
  );
}

export function MobileMapSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="lg:hidden xl:hidden border-b border-[var(--border-default)]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs text-zinc-500 hover:text-zinc-400"
      >
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3" />
          <span>Live Map</span>
        </div>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {expanded && (
        <div className="px-4 pb-3">
          <LiveMap />
        </div>
      )}
    </div>
  );
}

export function MobileQuickActions({ onQuickAction }: MobileHeaderProps) {
  const actions = [
    { icon: '🧪', label: 'Test', prefill: COOL_TEST_MESSAGE },
    { icon: '🚇', label: 'Subway', prefill: "When's the next train near me?" },
    { icon: '🚗', label: 'Ride', prefill: 'Get me a ride to ' },
    { icon: '🍕', label: 'Food', prefill: 'Order me something to eat' },
    { icon: '🎫', label: 'Events', prefill: "What's happening in NYC tonight?" },
    { icon: '🚲', label: 'Bike', prefill: 'Any Citi Bikes available near me?' },
    { icon: '🔍', label: 'Search', prefill: 'Search for ' },
  ];

  return (
    <div className="xl:hidden lg:hidden flex gap-2 px-3 py-2 overflow-x-auto border-b border-[var(--border-default)]">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={() => onQuickAction(a.prefill)}
          className="shrink-0 flex items-center gap-1.5 bg-zinc-900 border border-[var(--border-default)]
            hover:border-[var(--border-active)] rounded-full px-3 py-1.5 text-xs text-zinc-400 transition-colors"
        >
          <span>{a.icon}</span>
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  );
}
