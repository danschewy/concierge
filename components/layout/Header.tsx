'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import BlaxelStatus from '@/components/widgets/BlaxelStatus';
import WeatherMini from '@/components/widgets/WeatherMini';
import type { WeatherData } from '@/lib/types';

const HEADER_WEATHER_REFRESH_MS = 10 * 60 * 1000;

export default function Header() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {},
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  }, []);

  const latitude = location?.latitude;
  const longitude = location?.longitude;

  useEffect(() => {
    let isCancelled = false;

    const loadWeather = async () => {
      try {
        const query =
          typeof latitude === 'number' && typeof longitude === 'number'
          ? `?latitude=${latitude}&longitude=${longitude}`
          : '';
        const response = await fetch(`/api/weather${query}`, { cache: 'no-store' });
        if (!response.ok) return;

        const data = (await response.json()) as WeatherData;
        if (!isCancelled && data && typeof data.temp === 'number') {
          setWeather(data);
        }
      } catch (error) {
        console.error('Failed to refresh header weather:', error);
      }
    };

    void loadWeather();
    const intervalId = window.setInterval(() => {
      void loadWeather();
    }, HEADER_WEATHER_REFRESH_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [latitude, longitude]);

  const locationLabel = useMemo(() => {
    if (location) return 'Live location';
    if (weather) return 'NYC fallback';
    return 'Locating...';
  }, [location, weather]);

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
            <span className="text-xs">{locationLabel}</span>
          </div>
          <div className="hidden sm:block">
            {weather ? (
              <WeatherMini data={weather} />
            ) : (
              <span className="font-mono text-xs text-zinc-500">--°F</span>
            )}
          </div>
        </div>

        {/* Right: Status & Time */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <BlaxelStatus />
          </div>
          <span className="font-mono text-xs text-zinc-500">{now}</span>
        </div>
      </div>
    </header>
  );
}
