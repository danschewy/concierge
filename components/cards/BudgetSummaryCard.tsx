'use client';

import CardShell from '@/components/shared/CardShell';
import { DollarSign, TrendingUp } from 'lucide-react';
import type { FinancialSummary } from '@/lib/types';

interface BudgetSummaryCardProps {
  data: FinancialSummary;
}

export default function BudgetSummaryCard({ data }: BudgetSummaryCardProps) {
  const remaining = data.weeklyBudget - data.weeklySpend;
  const percentUsed = Math.round((data.weeklySpend / data.weeklyBudget) * 100);
  const barColor = percentUsed < 50 ? 'bg-emerald-500' : percentUsed < 80 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <CardShell>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="font-medium text-zinc-200">Budget Summary</span>
          </div>
          <span className="font-mono text-sm text-zinc-400">{percentUsed}% used</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs text-zinc-500">Checking Balance</div>
            <div className="font-mono text-xl text-zinc-100">${data.checkingBalance.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500">This Week</div>
            <div className="font-mono text-lg text-zinc-300">${data.weeklySpend}</div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor} transition-all duration-500`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
          <div className="text-xs text-zinc-500">
            ${remaining.toLocaleString()} of ${data.weeklyBudget.toLocaleString()} remaining
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800">
          {data.categories.map((cat, i) => (
            <div key={i} className="flex items-center justify-between bg-zinc-800/50 rounded-md px-2.5 py-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-zinc-400">{cat.name}</span>
              </div>
              <span className="font-mono text-xs text-zinc-300">${cat.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}
