'use client';

interface StatusBadgeProps {
  status: string;
  variant?: 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan' | 'zinc';
}

const variantClasses: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  zinc: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

const dotColors: Record<string, string> = {
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
  violet: 'bg-violet-400',
  cyan: 'bg-cyan-400',
  zinc: 'bg-zinc-400',
};

export default function StatusBadge({ status, variant = 'emerald' }: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-mono border
        ${variantClasses[variant]}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      {status}
    </span>
  );
}
