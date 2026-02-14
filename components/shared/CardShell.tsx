'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardShellProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function CardShell({ children, className = '', delay = 0 }: CardShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`
        bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-4
        hover:-translate-y-0.5 hover:border-[var(--border-active)] hover:shadow-lg hover:shadow-black/20
        transition-all duration-200 ease-out
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
