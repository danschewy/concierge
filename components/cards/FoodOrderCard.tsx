'use client';

import CardShell from '@/components/shared/CardShell';
import StatusStepper from '@/components/shared/StatusStepper';
import StatusBadge from '@/components/shared/StatusBadge';
import { UtensilsCrossed, Clock } from 'lucide-react';
import type { FoodOrder } from '@/lib/types';

interface FoodOrderCardProps {
  data: FoodOrder;
}

const statusSteps = ['Confirmed', 'Preparing', 'Dasher Assigned', 'En Route', 'Delivered'];

function getStepIndex(status: FoodOrder['status']): number {
  const map: Record<FoodOrder['status'], number> = {
    confirmed: 0,
    preparing: 1,
    dasher_assigned: 2,
    en_route: 3,
    delivered: 4,
  };
  return map[status];
}

export default function FoodOrderCard({ data }: FoodOrderCardProps) {
  return (
    <CardShell>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-400" />
            <div>
              <div className="font-medium text-zinc-200">{data.restaurant}</div>
              {data.dasherName && (
                <div className="text-xs text-zinc-500">Dasher: {data.dasherName}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-zinc-500" />
            <span className="font-mono text-sm text-zinc-300">{data.etaMinutes} min</span>
          </div>
        </div>

        <div className="space-y-1 border-t border-zinc-800 pt-2">
          {data.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-zinc-300">{item.quantity}× {item.name}</span>
              <span className="font-mono text-zinc-400">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-800 pt-2 space-y-0.5">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Subtotal</span>
            <span className="font-mono">${data.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Tax</span>
            <span className="font-mono">${data.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Tip</span>
            <span className="font-mono">${data.tip.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-zinc-200 pt-1">
            <span>Total</span>
            <span className="font-mono">${data.total.toFixed(2)}</span>
          </div>
        </div>

        <StatusStepper steps={statusSteps} currentStep={getStepIndex(data.status)} />
      </div>
    </CardShell>
  );
}
