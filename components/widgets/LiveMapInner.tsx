'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { BikeStation, RideStatus } from '@/lib/types';
import { NYC_DEFAULTS, MAPBOX_DARK_STYLE } from '@/lib/constants';

const LOCATION_REFRESH_MS = 45_000;
const BIKE_REFRESH_MS = 60_000;

interface LiveMapInnerProps {
  rideStatus?: RideStatus | null;
}

function stationMarkerColor(availableBikes: number): string {
  if (availableBikes >= 5) return '#34d399';
  if (availableBikes >= 1) return '#fbbf24';
  return '#fb7185';
}

export default function LiveMapInner({ rideStatus }: LiveMapInnerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  const bikeMarkers = useRef<mapboxgl.Marker[]>([]);
  const hasCenteredOnUser = useRef(false);
  const [bikeStations, setBikeStations] = useState<BikeStation[]>([]);
  const [isLiveLocation, setIsLiveLocation] = useState(false);
  const [userLocation, setUserLocation] = useState({
    latitude: NYC_DEFAULTS.latitude,
    longitude: NYC_DEFAULTS.longitude,
  });
  const userLocationRef = useRef(userLocation);

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
      const currentLocation = userLocationRef.current;

      // User marker
      const userEl = document.createElement('div');
      userEl.className = 'w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50';
      userMarker.current = new mapboxgl.Marker({ element: userEl })
        .setLngLat([currentLocation.longitude, currentLocation.latitude])
        .addTo(m);
    });

    return () => {
      bikeMarkers.current.forEach((marker) => marker.remove());
      bikeMarkers.current = [];
      userMarker.current?.remove();
      userMarker.current = null;
      driverMarker.current?.remove();
      driverMarker.current = null;
      m.remove();
      map.current = null;
    };
  }, [token]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return;
    }

    let isCancelled = false;

    const refreshLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isCancelled) return;
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLiveLocation(true);
        },
        () => {
          // Keep fallback location if user denies permission.
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60_000,
        }
      );
    };

    refreshLocation();
    const intervalId = window.setInterval(refreshLocation, LOCATION_REFRESH_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const refreshBikeStations = async () => {
      try {
        const params = new URLSearchParams({
          latitude: String(userLocation.latitude),
          longitude: String(userLocation.longitude),
        });
        const response = await fetch(`/api/transit/bikes?${params}`, {
          cache: 'no-store',
        });
        if (!response.ok) return;

        const data = (await response.json()) as BikeStation[];
        if (!isCancelled && Array.isArray(data)) {
          setBikeStations(data);
        }
      } catch (error) {
        console.error('Failed to refresh bike stations:', error);
      }
    };

    void refreshBikeStations();
    const intervalId = window.setInterval(() => {
      void refreshBikeStations();
    }, BIKE_REFRESH_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [userLocation.latitude, userLocation.longitude]);

  useEffect(() => {
    userLocationRef.current = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    };
    if (!userMarker.current || !map.current) return;

    userMarker.current.setLngLat([userLocation.longitude, userLocation.latitude]);
    if (isLiveLocation && !hasCenteredOnUser.current) {
      map.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 13.5,
        duration: 900,
      });
      hasCenteredOnUser.current = true;
    }
  }, [isLiveLocation, userLocation.latitude, userLocation.longitude]);

  useEffect(() => {
    if (!map.current) return;

    bikeMarkers.current.forEach((marker) => marker.remove());
    bikeMarkers.current = [];

    bikeStations.forEach((station) => {
      if (
        typeof station.latitude !== 'number' ||
        typeof station.longitude !== 'number'
      ) {
        return;
      }

      const markerEl = document.createElement('div');
      markerEl.className =
        'w-2.5 h-2.5 rounded-full border border-zinc-950 shadow-lg';
      markerEl.style.backgroundColor = stationMarkerColor(
        station.availableBikes
      );

      const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(
        `<div class="text-xs"><strong>${station.name}</strong><br/>${station.availableBikes} bikes · ${station.availableDocks} docks</div>`
      );

      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([station.longitude, station.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      bikeMarkers.current.push(marker);
    });
  }, [bikeStations]);

  useEffect(() => {
    if (!map.current) return;
    const m = map.current;

    const updateRideOverlay = () => {
      if (m.getLayer('route-line')) {
        m.removeLayer('route-line');
      }
      if (m.getSource('route')) {
        m.removeSource('route');
      }
      driverMarker.current?.remove();
      driverMarker.current = null;

      const routeCoords = rideStatus?.routeCoordinates;
      if (!routeCoords || routeCoords.length < 2) {
        return;
      }

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

      if (rideStatus.driverLocation) {
        const driverEl = document.createElement('div');
        driverEl.innerHTML = '🚗';
        driverEl.className = 'text-lg';
        driverMarker.current = new mapboxgl.Marker({ element: driverEl })
          .setLngLat(rideStatus.driverLocation)
          .addTo(m);
      }

      const bounds = new mapboxgl.LngLatBounds();
      routeCoords.forEach((coord) => bounds.extend(coord));
      m.fitBounds(bounds, { padding: 40 });
    };

    if (m.isStyleLoaded()) {
      updateRideOverlay();
    } else {
      m.once('load', updateRideOverlay);
    }
  }, [rideStatus]);

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
