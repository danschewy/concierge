'use client';

import CardShell from '@/components/shared/CardShell';
import { Cloud, Droplets, Wind } from 'lucide-react';
import type { WeatherData } from '@/lib/types';

interface WeatherCardProps {
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
  Fog: '🌫️',
};

export default function WeatherCard({ data }: WeatherCardProps) {
  return (
    <CardShell>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{weatherEmoji[data.condition] || '🌤️'}</span>
            <div>
              <div className="font-mono text-2xl text-zinc-100">{data.temp}°F</div>
              <div className="text-xs text-zinc-500">Feels like {data.feelsLike}°F</div>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Droplets className="w-3 h-3" />
              {data.humidity}%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Wind className="w-3 h-3" />
              {data.wind} mph
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-1 border-t border-zinc-800">
          {data.hourlyForecast.slice(0, 4).map((hour, i) => (
            <div key={i} className="flex-1 text-center py-1">
              <div className="text-[10px] text-zinc-500 mb-1">{hour.time}</div>
              <div className="text-sm">{weatherEmoji[hour.condition] || <Cloud className="w-4 h-4 mx-auto text-zinc-500" />}</div>
              <div className="font-mono text-xs text-zinc-300 mt-1">{hour.temp}°</div>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}
