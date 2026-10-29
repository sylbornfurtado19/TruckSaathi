'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

export const RouteProgressBar: React.FC = () => {
  const pathname = usePathname();
  const shouldReduce = useReducedMotion();

  if (shouldReduce) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2.5px] pointer-events-none overflow-hidden">
      <motion.div
        key={pathname}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{
          scaleX: [0, 0.65, 1],
          opacity: [1, 1, 0],
          transition: {
            duration: 0.55,
            times: [0, 0.7, 1],
            ease: 'easeOut'
          }
        }}
        style={{ originX: 0 }}
        className="h-full w-full bg-gradient-to-r from-brand-orange via-amber-400 to-cyan-400 shadow-[0_0_12px_rgba(255,107,0,0.8)]"
      />
    </div>
  );
};
