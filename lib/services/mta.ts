import type { SubwayStatus, SubwayArrival } from '@/lib/types';
import { mockSubwayStatus } from '@/lib/mock-data';

// MTA GTFS-RT feed URL pattern (no API key required)
const MTA_FEED_BASE = 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct';

// Map subway lines to their GTFS feed identifiers
const LINE_TO_FEED: Record<string, string> = {
  '1': 'gtfs',
  '2': 'gtfs',
  '3': 'gtfs',
  '4': 'gtfs',
  '5': 'gtfs',
  '6': 'gtfs',
  'S': 'gtfs',
  'A': 'gtfs-ace',
  'C': 'gtfs-ace',
  'E': 'gtfs-ace',
  'B': 'gtfs-bdfm',
  'D': 'gtfs-bdfm',
  'F': 'gtfs-bdfm',
  'M': 'gtfs-bdfm',
  'N': 'gtfs-nqrw',
  'Q': 'gtfs-nqrw',
  'R': 'gtfs-nqrw',
  'W': 'gtfs-nqrw',
  'G': 'gtfs-g',
  'J': 'gtfs-jz',
  'Z': 'gtfs-jz',
  'L': 'gtfs-l',
  '7': 'gtfs-7',
};

// Common station name to GTFS stop ID mappings (partial list for key stations)
const STATION_STOP_IDS: Record<string, string[]> = {
  'spring st': ['627', '628'],
  'canal st': ['626', 'A38', 'R23', 'Q01'],
  'broadway-lafayette': ['D21', 'B06'],
  'bleecker st': ['629'],
  'prince st': ['R22'],
  '14 st': ['631', 'A31', 'L01'],
  '14 st-union sq': ['635', 'L03', 'R20'],
  '34 st-penn': ['A28', '128'],
  '42 st-times sq': ['725', 'R16', 'A27'],
  '42 st-grand central': ['631', '723'],
  '59 st-columbus circle': ['125', 'A24'],
  '66 st-lincoln center': ['124'],
  '72 st': ['123'],
  '96 st': ['120'],
  '116 st-columbia': ['117'],
};

function normalizeStationName(station: string): string {
  return station.toLowerCase().replace(/[.]/g, '').trim();
}

function getStopIdsForStation(station: string): string[] {
  const normalized = normalizeStationName(station);
  for (const [key, ids] of Object.entries(STATION_STOP_IDS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return ids;
    }
  }
  // Return empty array if station not found in our mapping
  return [];
}

function getFeedUrlsForLine(line?: string): string[] {
  if (line) {
    const feed = LINE_TO_FEED[line.toUpperCase()];
    return feed ? [`${MTA_FEED_BASE}/${feed}`] : [];
  }
  // If no line specified, check the most common feeds
  return [
    `${MTA_FEED_BASE}/gtfs`,
    `${MTA_FEED_BASE}/gtfs-ace`,
    `${MTA_FEED_BASE}/gtfs-bdfm`,
    `${MTA_FEED_BASE}/gtfs-nqrw`,
  ];
}

function determineDirection(stopId: string): 'uptown' | 'downtown' {
  // GTFS convention: stop IDs ending in 'N' are northbound (uptown),
  // 'S' are southbound (downtown)
  if (stopId.endsWith('N')) return 'uptown';
  if (stopId.endsWith('S')) return 'downtown';
  return 'uptown';
}

function extractRouteId(tripUpdate: {
  trip?: { routeId?: string | null };
}): string {
  return tripUpdate.trip?.routeId ?? '';
}

export async function getSubwayStatus(
  station: string,
  line?: string
): Promise<SubwayStatus> {
  try {
    const GtfsRealtimeBindings = (await import('gtfs-realtime-bindings')).default;

    const feedUrls = getFeedUrlsForLine(line);
    if (feedUrls.length === 0) {
      console.warn(`Unknown subway line: ${line}, falling back to mock data`);
      return { ...mockSubwayStatus, station };
    }

    const stopIds = getStopIdsForStation(station);
    const arrivals: SubwayArrival[] = [];
    const alerts: string[] = [];
    const now = Date.now();

    for (const feedUrl of feedUrls) {
      try {
        const response = await fetch(feedUrl, {
          headers: {
            Accept: 'application/x-protobuf',
          },
        });

        if (!response.ok) {
          console.warn(`MTA feed returned ${response.status} for ${feedUrl}`);
          continue;
        }

        const buffer = await response.arrayBuffer();
        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
          new Uint8Array(buffer)
        );

        for (const entity of feed.entity) {
          // Process trip updates for arrival times
          if (entity.tripUpdate) {
            const routeId = extractRouteId(entity.tripUpdate);

            // Filter by line if specified
            if (line && routeId.toUpperCase() !== line.toUpperCase()) {
              continue;
            }

            for (const stopTimeUpdate of entity.tripUpdate.stopTimeUpdate ?? []) {
              const stopId = stopTimeUpdate.stopId ?? '';
              const baseStopId = stopId.replace(/[NS]$/, '');

              // Check if this stop matches our station
              const matchesStation =
                stopIds.length === 0 || stopIds.some((id) => baseStopId === id);

              if (!matchesStation) continue;

              const arrivalTimestamp = stopTimeUpdate.arrival?.time;
              if (!arrivalTimestamp) continue;

              const arrivalMs =
                typeof arrivalTimestamp === 'number'
                  ? arrivalTimestamp * 1000
                  : Number(arrivalTimestamp) * 1000;

              // Only include future arrivals
              if (arrivalMs <= now) continue;

              const minutesAway = Math.round((arrivalMs - now) / 60000);

              // Only include arrivals within the next 30 minutes
              if (minutesAway > 30) continue;

              arrivals.push({
                line: routeId,
                direction: determineDirection(stopId),
                arrivalTime: new Date(arrivalMs),
                minutesAway,
              });
            }
          }

          // Process alerts
          if (entity.alert) {
            for (const informedEntity of entity.alert.informedEntity ?? []) {
              if (
                !line ||
                informedEntity.routeId?.toUpperCase() === line.toUpperCase()
              ) {
                const headerText =
                  entity.alert.headerText?.translation?.[0]?.text;
                if (headerText && !alerts.includes(headerText)) {
                  alerts.push(headerText);
                }
              }
            }
          }
        }
      } catch (feedError) {
        console.warn(`Error fetching MTA feed ${feedUrl}:`, feedError);
      }
    }

    // Sort arrivals by time
    arrivals.sort((a, b) => a.minutesAway - b.minutesAway);

    // If we got no arrivals, fall back to mock
    if (arrivals.length === 0) {
      console.warn('No arrivals found from MTA feeds, using mock data');
      return { ...mockSubwayStatus, station };
    }

    return {
      station,
      arrivals: arrivals.slice(0, 10), // Limit to 10 closest arrivals
      alerts,
    };
  } catch (error) {
    console.error('Error fetching MTA data:', error);
    return { ...mockSubwayStatus, station };
  }
}
