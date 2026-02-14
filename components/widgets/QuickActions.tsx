'use client';

import { Zap } from 'lucide-react';
import {
  FEATURED_QUICK_ACTION,
  QUICK_ACTION_GROUPS,
} from '@/lib/constants/quick-actions';

interface QuickActionsProps {
  onAction: (prefill: string) => void;
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-zinc-500" />
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Quick Actions</span>
      </div>

      <button
        onClick={() => onAction(FEATURED_QUICK_ACTION.prefill)}
        className="w-full rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-sky-500/10
          px-3 py-2.5 text-left transition-colors hover:border-emerald-400/40"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{FEATURED_QUICK_ACTION.icon}</span>
          <div className="text-xs text-zinc-100 font-medium">{FEATURED_QUICK_ACTION.label}</div>
        </div>
        <div className="text-[11px] text-zinc-300 mt-0.5">
          {FEATURED_QUICK_ACTION.description}
        </div>
      </button>

      <div className="text-[10px] text-zinc-500 px-0.5">
        Tap any action to prefill a message, then edit before sending.
      </div>

      <div className="space-y-4">
        {QUICK_ACTION_GROUPS.map((group) => (
          <div key={group.id} className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium px-0.5">
              {group.title}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {group.actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onAction(action.prefill)}
                  className="group min-h-[72px] rounded-lg border border-[var(--border-default)] bg-zinc-900/50 px-2.5 py-2 text-left
                    transition-all duration-200 hover:bg-zinc-800/70 hover:border-[var(--border-active)]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{action.icon}</span>
                    <span className="text-xs text-zinc-200 font-medium leading-tight">{action.label}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-zinc-500 leading-snug group-hover:text-zinc-400">
                    {action.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
