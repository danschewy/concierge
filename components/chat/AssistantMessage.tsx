'use client';

import { motion } from 'framer-motion';
import MarkdownMessage from './MarkdownMessage';

interface AssistantMessageProps {
  content: string;
}

export default function AssistantMessage({ content }: AssistantMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="max-w-[85%] flex items-start gap-2">
        <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-bold text-emerald-400">G</span>
        </div>
        <div className="bg-zinc-900 border border-[var(--border-default)] rounded-2xl rounded-tl-md px-4 py-2.5">
          <div className="text-zinc-200">
            <MarkdownMessage content={content} variant="assistant" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
