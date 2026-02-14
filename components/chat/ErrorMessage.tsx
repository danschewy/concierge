'use client';

import { motion } from 'framer-motion';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorMessageProps {
  content: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ content, onRetry }: ErrorMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="max-w-[85%] bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-rose-300">{content}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 mt-2 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
