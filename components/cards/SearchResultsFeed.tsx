'use client';

import CardShell from '@/components/shared/CardShell';
import { ExternalLink } from 'lucide-react';
import type { SearchResult } from '@/lib/types';

interface SearchResultsFeedProps {
  data: SearchResult[];
}

export default function SearchResultsFeed({ data }: SearchResultsFeedProps) {
  return (
    <CardShell>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Search Results</span>
        </div>

        <div className="space-y-2.5">
          {data.slice(0, 5).map((result, i) => (
            <div key={i} className="flex gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://www.google.com/s2/favicons?domain=${result.domain}&sz=32`}
                alt=""
                className="w-4 h-4 rounded mt-0.5 shrink-0"
                width={16}
                height={16}
              />
              <div className="flex-1 min-w-0">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-200 hover:text-violet-400 transition-colors flex items-center gap-1"
                >
                  <span className="truncate">{result.title}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                </a>
                <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">{result.snippet}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}
