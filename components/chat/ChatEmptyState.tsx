'use client';

export default function ChatEmptyState() {
  return (
    <div className="h-full flex items-center justify-center py-10">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border-default)] bg-zinc-900/40 p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.14),_transparent_55%)]" />
        <div className="relative space-y-3">
          <p className="text-lg font-medium text-zinc-100">
            Gotham is ready for a live mission.
          </p>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Ask for weather, subway, bikes, events, restaurants, web search, and budget checks.
            Use Quick Actions or the Cool Test Message button to run a multi-tool demo.
          </p>
        </div>
      </div>
    </div>
  );
}
