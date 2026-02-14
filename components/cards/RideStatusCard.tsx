'use client';

import CardShell from '@/components/shared/CardShell';
import StatusStepper from '@/components/shared/StatusStepper';
import StatusBadge from '@/components/shared/StatusBadge';
import { Car, MapPin, Clock, DollarSign } from 'lucide-react';
import type { RideStatus } from '@/lib/types';

interface RideStatusCardProps {
  data: RideStatus;
}

const statusSteps = ['Requested', 'Driver Assigned', 'En Route', 'Arriving', 'Complete'];

function getStepIndex(status: RideStatus['status']): number {
  const map: Record<RideStatus['status'], number> = {
    requested: 0,
    driver_assigned: 1,
    en_route: 2,
    arriving: 3,
    complete: 4,
  };
  return map[status];
}

function getStatusVariant(status: RideStatus['status']): 'emerald' | 'amber' | 'violet' | 'cyan' {
  if (status === 'complete') return 'emerald';
  if (status === 'arriving') return 'amber';
  return 'violet';
}

export default function RideStatusCard({ data }: RideStatusCardProps) {
  return (
    <CardShell>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-violet-400" />
            <span className="font-medium text-zinc-200">Ride Booked</span>
          </div>
          <StatusBadge
            status={data.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            variant={getStatusVariant(data.status)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-sm font-medium text-violet-300">
                {data.driverName[0]}
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-200">{data.driverName}</div>
                <div className="text-xs text-zinc-500">{data.vehicle}</div>
              </div>
            </div>
            <div className="font-mono text-xs text-zinc-500">{data.licensePlate}</div>
          </div>

          <div className="space-y-1.5 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span className="font-mono text-sm text-zinc-200">{data.etaMinutes} min</span>
            </div>
            <div className="flex items-center justify-end gap-1.5">
              <DollarSign className="w-3 h-3 text-zinc-500" />
              <span className="font-mono text-sm text-zinc-200">{data.fare}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>{data.pickup}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span>{data.dropoff}</span>
          </div>
        </div>

        <StatusStepper steps={statusSteps} currentStep={getStepIndex(data.status)} />
      </div>
    </CardShell>
  );
}
