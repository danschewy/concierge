'use client';

import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { RideStatus } from '@/lib/types';
import { NYC_DEFAULTS, MAPBOX_DARK_STYLE, DEMO_ROUTE_COORDINATES } from '@/lib/constants';

interface LiveMapInnerProps {
  rideStatus?: RideStatus | null;
}

export default function LiveMapInner({ rideStatus }: LiveMapInnerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!token) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_DARK_STYLE,
      center: [NYC_DEFAULTS.longitude, NYC_DEFAULTS.latitude],
      zoom: 13,
      attributionControl: false,
    });

    const m = map.current;

    m.on('load', () => {
      // User location marker
      const userEl = document.createElement('div');
      userEl.className = 'w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50';
      new mapboxgl.Marker({ element: userEl })
        .setLngLat([NYC_DEFAULTS.longitude, NYC_DEFAULTS.latitude])
        .addTo(m);

      // Route line
      const routeCoords = rideStatus?.routeCoordinates || DEMO_ROUTE_COORDINATES;
      m.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: routeCoords },
        },
      });

      m.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#8b5cf6',
          'line-width': 3,
          'line-opacity': 0.7,
          'line-dasharray': [2, 2],
        },
      });

      // Driver marker
      const driverPos = rideStatus?.driverLocation || [-74.002, 40.735] as [number, number];
      const driverEl = document.createElement('div');
      driverEl.innerHTML = '🚗';
      driverEl.className = 'text-xl';
      new mapboxgl.Marker({ element: driverEl })
        .setLngLat(driverPos)
        .addTo(m);

      // Fit bounds to route
      const bounds = new mapboxgl.LngLatBounds();
      routeCoords.forEach((coord) => bounds.extend(coord as [number, number]));
      m.fitBounds(bounds, { padding: 40 });
    });

    return () => {
      m.remove();
      map.current = null;
    };
  }, [token, rideStatus]);

  if (!token) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg overflow-hidden h-[240px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🗺️</div>
          <span className="text-xs text-zinc-600">Set NEXT_PUBLIC_MAPBOX_TOKEN for live map</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg overflow-hidden h-[240px]">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
