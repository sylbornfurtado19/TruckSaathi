'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { durations, easings } from '@/lib/motion';

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: durations.fast, ease: easings.easeOut }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
