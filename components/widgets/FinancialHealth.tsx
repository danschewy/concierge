'use client';

import { DollarSign } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { FinancialSummary } from '@/lib/types';

interface FinancialHealthProps {
  data: FinancialSummary;
}

export default function FinancialHealth({ data }: FinancialHealthProps) {
  const remaining = data.weeklyBudget - data.weeklySpend;
  const percentUsed = Math.round((data.weeklySpend / data.weeklyBudget) * 100);
  const barColor = percentUsed < 50 ? 'bg-emerald-500' : percentUsed < 80 ? 'bg-amber-500' : 'bg-rose-500';
  const chartColor = percentUsed < 50 ? '#34d399' : percentUsed < 80 ? '#fbbf24' : '#fb7185';

  const chartData = data.dailySpend.map((value, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    value,
  }));

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4 text-zinc-500" />
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Finances</span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="font-mono text-2xl text-zinc-100">${data.checkingBalance.toLocaleString()}</div>
          <div className="text-xs text-zinc-600">Checking balance</div>
        </div>

        <div className="h-12">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={1.5}
                fill="url(#sparkGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1">
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor} transition-all duration-500`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-zinc-500">
            ${remaining.toLocaleString()} of ${data.weeklyBudget.toLocaleString()} remaining
          </div>
        </div>
      </div>
    </div>
  );
}
