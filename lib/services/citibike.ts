import type { BikeStation } from '@/lib/types';
import { mockBikeStations } from '@/lib/mock-data';

const GBFS_STATUS_URL =
  'https://gbfs.citibikenyc.com/gbfs/2.3/station_status.json';
const GBFS_INFO_URL =
  'https://gbfs.citibikenyc.com/gbfs/2.3/station_information.json';

interface GBFSStationStatus {
  station_id: string;
  num_bikes_available: number;
  num_docks_available: number;
  is_renting: number;
  is_returning: number;
  is_installed: number;
}

interface GBFSStationInfo {
  station_id: string;
  name: string;
  lat: number;
  lon: number;
  capacity: number;
}

interface GBFSStatusResponse {
  data: {
    stations: GBFSStationStatus[];
  };
}

interface GBFSInfoResponse {
  data: {
    stations: GBFSStationInfo[];
  };
}

/**
 * Calculate distance between two coordinates in miles using the Haversine formula.
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimate walking time in minutes based on distance in miles.
 * Average walking speed: ~3 mph (20 min/mile).
 */
function estimateWalkingMinutes(distanceMiles: number): number {
  return Math.round(distanceMiles * 20);
}

function formatDistance(distanceMiles: number): string {
  if (distanceMiles < 0.1) {
    return `${Math.round(distanceMiles * 5280)} ft`;
  }
  return `${distanceMiles.toFixed(1)} mi`;
}

export async function getBikeAvailability(
  lat: number,
  lng: number
): Promise<BikeStation[]> {
  try {
    // Fetch station info and status in parallel
    const [infoRes, statusRes] = await Promise.all([
      fetch(GBFS_INFO_URL),
      fetch(GBFS_STATUS_URL),
    ]);

    if (!infoRes.ok || !statusRes.ok) {
      console.error(
        `GBFS API error: info=${infoRes.status}, status=${statusRes.status}`
      );
      return mockBikeStations;
    }

    const infoData: GBFSInfoResponse = await infoRes.json();
    const statusData: GBFSStatusResponse = await statusRes.json();

    // Build a lookup map for station status by ID
    const statusMap = new Map<string, GBFSStationStatus>();
    for (const station of statusData.data.stations) {
      statusMap.set(station.station_id, station);
    }

    // Calculate distance from the given location for each station
    // and combine with availability data
    const stationsWithDistance = infoData.data.stations
      .map((info) => {
        const status = statusMap.get(info.station_id);
        const distance = haversineDistance(lat, lng, info.lat, info.lon);

        return {
          info,
          status,
          distance,
        };
      })
      // Only include stations that are installed and renting
      .filter(
        (s) =>
          s.status &&
          s.status.is_installed === 1 &&
          s.status.is_renting === 1
      )
      // Sort by distance
      .sort((a, b) => a.distance - b.distance)
      // Take closest 5 stations
      .slice(0, 5);

    if (stationsWithDistance.length === 0) {
      return mockBikeStations;
    }

    return stationsWithDistance.map((s) => ({
      name: s.info.name,
      availableBikes: s.status!.num_bikes_available,
      availableDocks: s.status!.num_docks_available,
      distance: formatDistance(s.distance),
      walkingMinutes: estimateWalkingMinutes(s.distance),
      latitude: s.info.lat,
      longitude: s.info.lon,
    }));
  } catch (error) {
    console.error('Error fetching Citi Bike data:', error);
    return mockBikeStations;
  }
}
