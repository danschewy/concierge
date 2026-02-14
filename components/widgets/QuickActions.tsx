'use client';

import { Zap } from 'lucide-react';
import { COOL_TEST_MESSAGE } from '@/lib/constants/prompts';

interface QuickActionsProps {
  onAction: (prefill: string) => void;
}

const actions = [
  { icon: '🚇', label: 'Subway', prefill: "When's the next train near me?" },
  { icon: '🚗', label: 'Ride', prefill: 'Get me a ride to ' },
  { icon: '🍕', label: 'Food', prefill: 'Order me something to eat' },
  { icon: '🍽️', label: 'Dinner', prefill: 'Find me a restaurant for tonight' },
  { icon: '🎫', label: 'Events', prefill: "What's happening in NYC tonight?" },
  { icon: '🚲', label: 'Bike', prefill: 'Any Citi Bikes available near me?' },
  { icon: '📦', label: 'Errand', prefill: 'I need something picked up and delivered' },
  { icon: '🔍', label: 'Search', prefill: 'Search for ' },
];

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-zinc-500" />
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Quick Actions</span>
      </div>

      <button
        onClick={() => onAction(COOL_TEST_MESSAGE)}
        className="w-full mb-3 rounded-lg border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-sky-500/10
          px-3 py-2 text-left transition-colors hover:border-emerald-400/40"
      >
        <div className="text-xs text-zinc-200 font-medium">Cool Test Message</div>
        <div className="text-[11px] text-zinc-400 mt-0.5">
          Generates a multi-tool live demo prompt.
        </div>
      </button>

      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => onAction(action.prefill)}
            className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 border border-[var(--border-default)]
              hover:border-[var(--border-active)] rounded-lg px-3 py-2 transition-all duration-200 text-left"
          >
            <span className="text-base">{action.icon}</span>
            <span className="text-xs text-zinc-400">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
