'use client';

import CardShell from '@/components/shared/CardShell';
import { Bike, MapPin } from 'lucide-react';
import type { BikeStation } from '@/lib/types';

interface BikeAvailabilityCardProps {
  data: BikeStation[];
}

function bikeCountColor(count: number): string {
  if (count >= 5) return 'text-emerald-400';
  if (count >= 1) return 'text-amber-400';
  return 'text-rose-400';
}

function bikeCountBg(count: number): string {
  if (count >= 5) return 'bg-emerald-500/10';
  if (count >= 1) return 'bg-amber-500/10';
  return 'bg-rose-500/10';
}

export default function BikeAvailabilityCard({ data }: BikeAvailabilityCardProps) {
  return (
    <CardShell>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Bike className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-zinc-200">Citi Bike Stations</span>
        </div>

        <div className="space-y-2">
          {data.map((station, i) => (
            <div key={i} className="flex items-center justify-between bg-zinc-800/50 rounded-md px-3 py-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-zinc-500" />
                <div>
                  <div className="text-sm text-zinc-300">{station.name}</div>
                  <div className="text-[10px] text-zinc-600">{station.distance} · {station.walkingMinutes} min walk</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 ${bikeCountBg(station.availableBikes)} rounded-md px-2 py-1`}>
                  <Bike className={`w-3 h-3 ${bikeCountColor(station.availableBikes)}`} />
                  <span className={`font-mono text-sm ${bikeCountColor(station.availableBikes)}`}>
                    {station.availableBikes}
                  </span>
                </div>
                <div className="text-xs text-zinc-600 font-mono">
                  {station.availableDocks} docks
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}
