'use client';

import CardShell from '@/components/shared/CardShell';
import StatusBadge from '@/components/shared/StatusBadge';
import { Star, MapPin } from 'lucide-react';
import type { Restaurant } from '@/lib/types';

interface RestaurantCardProps {
  data: Restaurant;
}

export default function RestaurantCard({ data }: RestaurantCardProps) {
  return (
    <CardShell>
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-zinc-200">{data.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
              <span className="text-xs text-zinc-500">{data.address}</span>
            </div>
          </div>
          <StatusBadge
            status={data.isOpen ? 'Open' : 'Closed'}
            variant={data.isOpen ? 'emerald' : 'rose'}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-mono text-sm text-zinc-200">{data.rating}</span>
          </div>
          <span className="font-mono text-sm text-zinc-500">{'$'.repeat(data.priceLevel)}</span>
          <div className="flex gap-1.5">
            {data.cuisine.map((c, i) => (
              <span key={i} className="text-[10px] text-zinc-500 bg-zinc-800 rounded-full px-2 py-0.5">
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1 border-t border-zinc-800">
          <button className="flex-1 text-xs text-center py-1.5 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors">
            Book on Resy
          </button>
          <button className="flex-1 text-xs text-center py-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors">
            Book on OpenTable
          </button>
        </div>
      </div>
    </CardShell>
  );
}
