'use client';

import CardShell from '@/components/shared/CardShell';
import StatusStepper from '@/components/shared/StatusStepper';
import StatusBadge from '@/components/shared/StatusBadge';
import { Package, MapPin, Clock } from 'lucide-react';
import type { ErrandStatus } from '@/lib/types';

interface ErrandCardProps {
  data: ErrandStatus;
}

const statusSteps = ['Assigned', 'Picking Up', 'En Route', 'Delivered'];

function getStepIndex(status: ErrandStatus['status']): number {
  const map: Record<ErrandStatus['status'], number> = {
    assigned: 0,
    picking_up: 1,
    en_route: 2,
    delivered: 3,
  };
  return map[status];
}

export default function ErrandCard({ data }: ErrandCardProps) {
  return (
    <CardShell>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" />
            <span className="font-medium text-zinc-200">Errand</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge
              status={data.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              variant="cyan"
            />
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span className="font-mono text-sm text-zinc-300">{data.etaMinutes} min</span>
            </div>
          </div>
        </div>

        {data.dasherName && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs font-medium text-cyan-300">
              {data.dasherName[0]}
            </div>
            <span className="text-sm text-zinc-300">{data.dasherName}</span>
          </div>
        )}

        <div className="space-y-1.5 text-xs">
          <div className="flex items-start gap-2 text-zinc-400">
            <MapPin className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
            <span>{data.pickupAddress}</span>
          </div>
          <div className="flex items-start gap-2 text-zinc-400">
            <MapPin className="w-3 h-3 text-rose-400 mt-0.5 shrink-0" />
            <span>{data.dropoffAddress}</span>
          </div>
        </div>

        <div className="text-xs text-zinc-500 bg-zinc-800/50 rounded-md px-2.5 py-1.5">
          <span className="text-zinc-400">Items:</span> {data.items}
        </div>

        <StatusStepper steps={statusSteps} currentStep={getStepIndex(data.status)} />
      </div>
    </CardShell>
  );
}
