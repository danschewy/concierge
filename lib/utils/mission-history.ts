'use client';

import type { MissionHistoryItem } from '@/lib/types';
import { generateId } from '@/lib/utils/format';

const STORAGE_KEY = 'gotham.missionHistory.v1';
const MAX_HISTORY_ITEMS = 12;
export const MISSION_HISTORY_UPDATED_EVENT = 'gotham:mission-history-updated';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function titleCase(value: string): string {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function commandLabel(toolName: string): string {
  return titleCase(toolName.replaceAll('_', ' '));
}

function summarizeMission(toolName: string, result: unknown): string {
  const data = isRecord(result) ? result : {};

  switch (toolName) {
    case 'get_subway_status': {
      const station = getString(data.station);
      return station ? `Checked subway status at ${station}` : 'Checked subway status';
    }
    case 'get_weather': {
      const condition = getString(data.condition);
      return condition ? `Checked weather: ${condition}` : 'Checked weather';
    }
    case 'get_bike_availability':
      return 'Checked bike availability';
    case 'book_ride': {
      const dropoff = getString(data.dropoff);
      return dropoff ? `Booked ride to ${dropoff}` : 'Booked ride';
    }
    case 'order_food': {
      const restaurant = getString(data.restaurant);
      return restaurant ? `Ordered food from ${restaurant}` : 'Ordered food';
    }
    case 'create_delivery': {
      const dropoff = getString(data.dropoffAddress);
      return dropoff ? `Created delivery to ${dropoff}` : 'Created delivery';
    }
    case 'book_reservation': {
      const venue = getString(data.venue);
      const source = getString(data.source);
      const provider = source === 'opentable' ? 'OpenTable' : 'Resy';
      return venue
        ? `Opened ${provider} booking for ${venue}`
        : `Opened ${provider} booking`;
    }
    case 'search_events':
      return 'Searched events';
    case 'search_restaurants':
      return 'Searched restaurants';
    case 'search_web':
      return 'Ran web search';
    case 'check_budget':
      return 'Checked budget';
    case 'check_calendar':
      return 'Checked calendar';
    case 'add_to_calendar': {
      const title = getString(data.title);
      return title ? `Added "${title}" to calendar` : 'Added event to calendar';
    }
    default:
      return `Completed ${commandLabel(toolName)}`;
  }
}

function normalizeItem(raw: unknown): MissionHistoryItem | null {
  if (!isRecord(raw)) return null;

  const id = getString(raw.id);
  const command = getString(raw.command);
  const summary = getString(raw.summary);
  const completedAt = getString(raw.completedAt);
  const status = getString(raw.status);

  if (!id || !command || !summary || !completedAt) return null;
  if (status !== 'completed') return null;

  return {
    id,
    command,
    summary,
    completedAt,
    status: 'completed',
  };
}

function safeStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getMissionHistory(): MissionHistoryItem[] {
  if (!safeStorageAvailable()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeItem)
      .filter((item): item is MissionHistoryItem => !!item)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  } catch {
    return [];
  }
}

function setMissionHistory(items: MissionHistoryItem[]): void {
  if (!safeStorageAvailable()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function appendMissionHistory(toolName: string, result: unknown): MissionHistoryItem | null {
  if (!safeStorageAvailable() || !toolName) return null;

  const nextItem: MissionHistoryItem = {
    id: generateId(),
    command: commandLabel(toolName),
    summary: summarizeMission(toolName, result),
    completedAt: new Date().toISOString(),
    status: 'completed',
  };

  const nextHistory = [nextItem, ...getMissionHistory()].slice(0, MAX_HISTORY_ITEMS);
  setMissionHistory(nextHistory);
  window.dispatchEvent(new Event(MISSION_HISTORY_UPDATED_EVENT));

  return nextItem;
}
