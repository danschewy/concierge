'use client';

import { motion } from 'framer-motion';

interface UserMessageProps {
  content: string;
}

export default function UserMessage({ content }: UserMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-end"
    >
      <div className="max-w-[80%] flex items-start gap-2">
        <div className="bg-zinc-800 rounded-2xl rounded-tr-md px-4 py-2.5">
          <p className="text-sm text-zinc-100">{content}</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-medium text-violet-300 shrink-0 mt-0.5">
          D
        </div>
      </div>
    </motion.div>
  );
}
