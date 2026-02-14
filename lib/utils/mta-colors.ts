import { MTA_COLORS, MTA_DARK_TEXT_LINES } from '@/lib/constants';

export function getMtaColor(line: string): string {
  return MTA_COLORS[line.toUpperCase()] || '#A7A9AC';
}

export function getMtaTextColor(line: string): string {
  return MTA_DARK_TEXT_LINES.has(line.toUpperCase()) ? '#000000' : '#FFFFFF';
}
