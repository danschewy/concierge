'use client';

import CardShell from '@/components/shared/CardShell';
import { CalendarDays, Clock, Users, Check } from 'lucide-react';
import type { Reservation } from '@/lib/types';

interface ReservationTicketProps {
  data: Reservation;
}

export default function ReservationTicket({ data }: ReservationTicketProps) {
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
              via {data.source === 'resy' ? 'Resy' : 'OpenTable'}
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
            <Check className="w-3 h-3 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Confirmed</span>
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

        <div className="border-t border-dashed border-zinc-700 pt-2 flex items-center justify-between">
          <span className="font-mono text-xs text-zinc-500">#{data.confirmationCode}</span>
        </div>
      </div>
    </CardShell>
  );
}
