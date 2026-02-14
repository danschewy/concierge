'use client';

import { motion } from 'framer-motion';

interface TranscriptPillProps {
  userText: string;
  agentText: string;
  isListening: boolean;
}

export default function TranscriptPill({ userText, agentText, isListening }: TranscriptPillProps) {
  const displayText = isListening ? userText : agentText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="max-w-[200px] bg-zinc-900/90 backdrop-blur-lg border border-[var(--border-default)]
        rounded-full px-4 py-2 text-xs truncate"
    >
      <span className={isListening ? 'text-zinc-200' : 'text-cyan-400'}>
        {displayText || (isListening ? 'Speak now...' : '')}
      </span>
    </motion.div>
  );
}
