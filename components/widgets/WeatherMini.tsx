'use client';

import type { WeatherData } from '@/lib/types';

interface WeatherMiniProps {
  data: WeatherData;
}

const weatherEmoji: Record<string, string> = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Snow: '❄️',
  Thunderstorm: '⛈️',
  Drizzle: '🌦️',
  Mist: '🌫️',
};

export default function WeatherMini({ data }: WeatherMiniProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm">{weatherEmoji[data.condition] || '🌤️'}</span>
      <span className="font-mono text-xs text-zinc-400">{data.temp}°F</span>
    </div>
  );
}
