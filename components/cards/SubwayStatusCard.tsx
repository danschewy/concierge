'use client';

import CardShell from '@/components/shared/CardShell';
import SubwayLineBadge from '@/components/shared/SubwayLineBadge';
import StatusBadge from '@/components/shared/StatusBadge';
import { AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import type { SubwayStatus } from '@/lib/types';

interface SubwayStatusCardProps {
  data: SubwayStatus;
}

export default function SubwayStatusCard({ data }: SubwayStatusCardProps) {
  const uptownArrivals = data.arrivals.filter(a => a.direction === 'uptown').slice(0, 3);
  const downtownArrivals = data.arrivals.filter(a => a.direction === 'downtown').slice(0, 3);

  return (
    <CardShell>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚇</span>
            <span className="font-medium text-zinc-200">{data.station}</span>
          </div>
          <StatusBadge status="Live" variant="emerald" />
        </div>

        {data.alerts.length > 0 && (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <span className="text-xs text-amber-300">{data.alerts[0]}</span>
          </div>
        )}

        <div className="space-y-2">
          {uptownArrivals.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <ArrowUp className="w-3 h-3 text-zinc-500" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Uptown</span>
              </div>
              <div className="flex gap-2">
                {uptownArrivals.map((arrival, i) => (
                  <div key={i} className="flex items-center gap-2 bg-zinc-800/50 rounded-md px-2.5 py-1.5">
                    <SubwayLineBadge line={arrival.line} size="sm" />
                    <span className="font-mono text-sm text-zinc-200">{arrival.minutesAway} min</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {downtownArrivals.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <ArrowDown className="w-3 h-3 text-zinc-500" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Downtown</span>
              </div>
              <div className="flex gap-2">
                {downtownArrivals.map((arrival, i) => (
                  <div key={i} className="flex items-center gap-2 bg-zinc-800/50 rounded-md px-2.5 py-1.5">
                    <SubwayLineBadge line={arrival.line} size="sm" />
                    <span className="font-mono text-sm text-zinc-200">{arrival.minutesAway} min</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </CardShell>
  );
}
