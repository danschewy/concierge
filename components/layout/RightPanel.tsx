'use client';

import LiveMap from '@/components/widgets/LiveMap';
import QuickActions from '@/components/widgets/QuickActions';
import { mockRideStatus } from '@/lib/mock-data';

interface RightPanelProps {
  onQuickAction: (text: string) => void;
}

export default function RightPanel({ onQuickAction }: RightPanelProps) {
  return (
    <aside className="hidden xl:flex flex-col w-[300px] shrink-0 border-l border-[var(--border-default)] p-4 space-y-4 overflow-y-auto">
      {/* Live Map */}
      <LiveMap rideStatus={mockRideStatus} />

      {/* Quick Actions */}
      <QuickActions onAction={onQuickAction} />
    </aside>
  );
}
