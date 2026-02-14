'use client';

import { motion } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';
import { TOOL_ICONS } from '@/lib/types/tools';
import type { ToolName } from '@/lib/types/tools';

interface ToolCallIndicatorProps {
  toolName: string;
  status?: 'pending' | 'complete' | 'error';
}

export default function ToolCallIndicator({ toolName, status = 'pending' }: ToolCallIndicatorProps) {
  const icon = TOOL_ICONS[toolName as ToolName] || '🔧';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex justify-start"
    >
      <div
        className={`
          inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-mono
          ${status === 'error'
            ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            : status === 'complete'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
          }
        `}
      >
        <span>{icon}</span>
        <span>{toolName}</span>
        {status === 'pending' && (
          <Loader2 className="w-3 h-3 animate-spin" />
        )}
        {status === 'complete' && (
          <Check className="w-3 h-3" />
        )}
        {status === 'error' && (
          <X className="w-3 h-3" />
        )}
      </div>
    </motion.div>
  );
}
