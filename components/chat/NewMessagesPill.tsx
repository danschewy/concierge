'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

interface NewMessagesPillProps {
  visible: boolean;
  onClick: () => void;
}

export default function NewMessagesPill({ visible, onClick }: NewMessagesPillProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          onClick={onClick}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10
            flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500
            text-white text-xs font-medium rounded-full px-3 py-1.5
            shadow-lg shadow-violet-500/20 transition-colors"
        >
          <ArrowDown className="w-3 h-3" />
          New messages
        </motion.button>
      )}
    </AnimatePresence>
  );
}
