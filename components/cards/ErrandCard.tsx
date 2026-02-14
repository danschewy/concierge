'use client';

import { useEffect, useMemo, useState } from 'react';
import CardShell from '@/components/shared/CardShell';
import StatusStepper from '@/components/shared/StatusStepper';
import StatusBadge from '@/components/shared/StatusBadge';
import { Package, MapPin, Clock, ExternalLink } from 'lucide-react';
import type { ErrandStatus } from '@/lib/types';
import { serializeTrackingQuery } from '@/lib/utils/tracking';

interface ErrandCardProps {
  data: ErrandStatus;
}

const statusSteps = ['Assigned', 'Picking Up', 'En Route', 'Delivered'];
const ERRAND_POLL_MS = 15_000;

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
  const [liveData, setLiveData] = useState<ErrandStatus>(data);

  useEffect(() => {
    setLiveData(data);
  }, [data]);

  const statusUrl = useMemo(() => {
    if (!liveData.id) return '';

    const trackingQuery = serializeTrackingQuery(liveData.tracking);
    const base = `/api/doordash/status/${encodeURIComponent(liveData.id)}`;
    return trackingQuery ? `${base}?${trackingQuery}` : base;
  }, [liveData.id, liveData.tracking]);

  useEffect(() => {
    if (!statusUrl || liveData.status === 'delivered') return;

    let isCancelled = false;

    const refresh = async () => {
      try {
        const response = await fetch(statusUrl, { cache: 'no-store' });
        if (!response.ok) return;

        const next = (await response.json()) as ErrandStatus;
        if (!isCancelled) {
          setLiveData(next);
        }
      } catch (error) {
        console.error('Failed to refresh errand status:', error);
      }
    };

    void refresh();
    const intervalId = window.setInterval(() => {
      void refresh();
    }, ERRAND_POLL_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [statusUrl, liveData.status]);

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
              status={liveData.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              variant="cyan"
            />
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span className="font-mono text-sm text-zinc-300">{liveData.etaMinutes} min</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-500">
          <span>
            Source: {liveData.source === 'live' ? 'DoorDash Live' : 'Mock'}
          </span>
          {liveData.doordashStatus && (
            <span>DoorDash: {liveData.doordashStatus}</span>
          )}
        </div>

        {liveData.tracking && (
          <div className="text-[10px] text-zinc-500">
            {liveData.tracking.provider === 'blaxel' ? 'Blaxel task' : 'Local task'}: {liveData.tracking.status}
          </div>
        )}

        {(liveData.doordashSupportReference || liveData.trackingUrl) && (
          <div className="rounded-md border border-zinc-800/80 bg-zinc-900/40 px-2.5 py-2 text-[10px] text-zinc-400 space-y-1">
            {liveData.doordashSupportReference && (
              <div>Support Ref: <span className="font-mono text-zinc-300">{liveData.doordashSupportReference}</span></div>
            )}
            {liveData.trackingUrl && (
              <a
                href={liveData.trackingUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200"
              >
                Track in DoorDash
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {liveData.dasherName && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs font-medium text-cyan-300">
              {liveData.dasherName[0]}
            </div>
            <span className="text-sm text-zinc-300">{liveData.dasherName}</span>
          </div>
        )}

        <div className="space-y-1.5 text-xs">
          <div className="flex items-start gap-2 text-zinc-400">
            <MapPin className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
            <span>{liveData.pickupAddress}</span>
          </div>
          <div className="flex items-start gap-2 text-zinc-400">
            <MapPin className="w-3 h-3 text-rose-400 mt-0.5 shrink-0" />
            <span>{liveData.dropoffAddress}</span>
          </div>
        </div>

        <div className="text-xs text-zinc-500 bg-zinc-800/50 rounded-md px-2.5 py-1.5">
          <span className="text-zinc-400">Items:</span> {liveData.items}
        </div>

        <StatusStepper steps={statusSteps} currentStep={getStepIndex(liveData.status)} />
      </div>
    </CardShell>
  );
}
