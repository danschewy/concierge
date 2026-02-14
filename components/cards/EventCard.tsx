'use client';

import CardShell from '@/components/shared/CardShell';
import StatusBadge from '@/components/shared/StatusBadge';
import { Calendar, MapPin, Tag, ExternalLink } from 'lucide-react';
import type { EventListing } from '@/lib/types';

interface EventCardProps {
  data: EventListing;
}

function availabilityVariant(a: EventListing['availability']): 'emerald' | 'amber' | 'rose' {
  if (a === 'available') return 'emerald';
  if (a === 'limited') return 'amber';
  return 'rose';
}

function availabilityLabel(a: EventListing['availability']): string {
  if (a === 'available') return 'Available';
  if (a === 'limited') return 'Limited';
  return 'Sold Out';
}

export default function EventCard({ data }: EventCardProps) {
  return (
    <CardShell>
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-zinc-200 truncate">{data.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
              <span className="text-xs text-zinc-500 truncate">{data.venue}</span>
            </div>
          </div>
          <StatusBadge status={availabilityLabel(data.availability)} variant={availabilityVariant(data.availability)} />
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{data.date} · {data.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>{data.genre}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
          <span className="font-mono text-sm text-zinc-300">{data.priceRange}</span>
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Get Tickets
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </CardShell>
  );
}
