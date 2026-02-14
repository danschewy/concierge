'use client';

import { motion } from 'framer-motion';

interface ReasoningStepProps {
  content: string;
  isStreaming?: boolean;
}

export default function ReasoningStep({ content, isStreaming }: ReasoningStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="max-w-[85%] border-l-2 border-violet-500/50 pl-3 py-0.5">
        <p className="text-sm text-zinc-400">
          {content}
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 align-middle animate-pulse" />
          )}
        </p>
        {!content && isStreaming && (
          <div className="flex gap-1 py-1">
            <div className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <div className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <div className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-500" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
