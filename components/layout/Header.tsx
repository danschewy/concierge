'use client';

import { MapPin, Settings } from 'lucide-react';
import BlaxelStatus from '@/components/widgets/BlaxelStatus';
import WeatherMini from '@/components/widgets/WeatherMini';
import { mockWeather } from '@/lib/mock-data';

export default function Header() {
  const now = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  });

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-[var(--border-default)]">
      <div className="flex items-center justify-between px-4 h-12">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <h1 className="font-display text-base font-bold text-zinc-100 tracking-tight">
            Gotham Valet
          </h1>
          <div className="hidden sm:flex items-center gap-1.5 text-zinc-500">
            <MapPin className="w-3 h-3" />
            <span className="text-xs">SoHo, NYC</span>
          </div>
          <div className="hidden sm:block">
            <WeatherMini data={mockWeather} />
          </div>
        </div>

        {/* Right: Status & Time */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <BlaxelStatus />
          </div>
          <span className="font-mono text-xs text-zinc-500">{now}</span>
          <button
            className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
