'use client';

import { getMtaColor, getMtaTextColor } from '@/lib/utils/mta-colors';

interface SubwayLineBadgeProps {
  line: string;
  size?: 'sm' | 'md';
}

export default function SubwayLineBadge({ line, size = 'md' }: SubwayLineBadgeProps) {
  const bgColor = getMtaColor(line);
  const textColor = getMtaTextColor(line);
  const sizeClasses = size === 'sm' ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs';

  return (
    <span
      className={`${sizeClasses} rounded-full inline-flex items-center justify-center font-bold font-mono`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {line}
    </span>
  );
}
