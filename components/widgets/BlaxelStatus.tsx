'use client';

export default function BlaxelStatus() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span className="font-mono text-xs text-zinc-500">Blaxel Active</span>
      <span className="font-mono text-[10px] text-zinc-600">· 24ms</span>
    </div>
  );
}
