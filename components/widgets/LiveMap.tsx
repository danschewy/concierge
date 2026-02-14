'use client';

import { useEffect, useState } from 'react';
import type { RideStatus } from '@/lib/types';
import { NYC_DEFAULTS, MAPBOX_DARK_STYLE } from '@/lib/constants';

interface LiveMapProps {
  rideStatus?: RideStatus | null;
}

export default function LiveMap({ rideStatus }: LiveMapProps) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<LiveMapInnerProps> | null>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues with mapbox-gl
    import('./LiveMapInner').then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  if (!MapComponent) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg overflow-hidden h-[240px] flex items-center justify-center">
        <span className="text-xs text-zinc-600">Loading map...</span>
      </div>
    );
  }

  return <MapComponent rideStatus={rideStatus} />;
}

interface LiveMapInnerProps {
  rideStatus?: RideStatus | null;
}
