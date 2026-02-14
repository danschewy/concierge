'use client';

import CardShell from '@/components/shared/CardShell';
import { CalendarDays, Clock, Users, Check, ExternalLink } from 'lucide-react';
import type { Reservation } from '@/lib/types';

interface ReservationTicketProps {
  data: Reservation;
}

export default function ReservationTicket({ data }: ReservationTicketProps) {
  const providerName = data.source === 'resy' ? 'Resy' : 'OpenTable';
  const isConfirmed = data.status === 'confirmed';

  return (
    <CardShell className="relative overflow-hidden">
      {/* Perforated edge */}
      <div className="absolute left-0 top-0 bottom-0 w-3 flex flex-col justify-evenly">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-[var(--bg-primary)] -ml-1" />
        ))}
      </div>

      <div className="pl-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-lg font-semibold text-zinc-100">{data.venue}</div>
            <div className="text-xs text-zinc-500">
              via {providerName}
            </div>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 border ${
              isConfirmed
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/20'
            }`}
          >
            {isConfirmed ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <ExternalLink className="w-3 h-3 text-amber-400" />
            )}
            <span
              className={`text-xs font-medium ${
                isConfirmed ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {isConfirmed ? 'Confirmed' : `Complete on ${providerName}`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-zinc-500">
              <CalendarDays className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-wider">Date</span>
            </div>
            <div className="text-sm font-medium text-zinc-200">{data.date}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-zinc-500">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-wider">Time</span>
            </div>
            <div className="text-sm font-medium text-zinc-200">{data.time}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-zinc-500">
              <Users className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-wider">Party</span>
            </div>
            <div className="text-sm font-medium text-zinc-200">{data.partySize} guests</div>
          </div>
        </div>

        {data.bookingUrl ? (
          <a
            href={data.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition-colors"
          >
            Continue on {providerName}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : null}

        <div className="border-t border-dashed border-zinc-700 pt-2 flex items-center justify-between">
          <span className="font-mono text-xs text-zinc-500">#{data.confirmationCode}</span>
        </div>
      </div>
    </CardShell>
  );
}
