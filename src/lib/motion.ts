'use client';

import { useReducedMotion, Variants, Transition } from 'framer-motion';

/**
 * Standard spring configs for consistent physics across TruckSaathi.
 * Rule: Animate only transform and opacity to maintain 60fps budget.
 */
export const springs = {
  snappy: { type: 'spring', stiffness: 450, damping: 32 } as const,
  smooth: { type: 'spring', stiffness: 280, damping: 28 } as const,
  bounceless: { type: 'spring', stiffness: 350, damping: 40 } as const,
  gentle: { type: 'spring', stiffness: 180, damping: 24 } as const,
  tactile: { type: 'spring', stiffness: 500, damping: 26 } as const,
};

export const durations = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
  deliberate: 0.6,
};

export const easings = {
  easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeInOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  anticipate: [0.36, 0, 0.66, -0.56] as [number, number, number, number],
};

/**
 * Reusable animation variants.
 */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.base, ease: easings.easeOut }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: durations.fast }
  }
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.base, ease: easings.easeOut }
  },
  exit: {
    opacity: 0,
    transition: { duration: durations.fast }
  }
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.smooth
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: durations.fast }
  }
};

export const slideOverVariants: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: springs.smooth
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: durations.base, ease: easings.easeInOut }
  }
};

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.fast }
  },
  exit: {
    opacity: 0,
    transition: { duration: durations.fast }
  }
};

export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springs.snappy
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: durations.fast }
  }
};

export const staggerContainer = (staggerChildren = 0.05, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren
    }
  }
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springs.smooth
  }
};

export const shakeAnimation = {
  x: [-4, 4, -3, 3, -1, 1, 0],
  transition: { duration: 0.35, ease: 'easeInOut' }
};

export const buttonPress = {
  scale: 0.98,
  transition: { duration: 0.08 }
};

export const cardHover = {
  y: -2,
  transition: { duration: 0.2, ease: easings.easeOut }
};

/**
 * Hook to retrieve motion configs conditioned on user's reduced-motion preference.
 */
export function useMotionSafe() {
  const shouldReduce = useReducedMotion();

  const getTransition = (normalTransition: Transition, calmDuration = 0.01): Transition => {
    if (shouldReduce) {
      return { duration: calmDuration };
    }
    return normalTransition;
  };

  const safe = <T extends Record<string, unknown>>(normal: T, reducedFallback: Partial<T> = {}): T => {
    if (shouldReduce) return { ...normal, ...reducedFallback, x: 0, y: 0, scale: 1, rotate: 0, rotateX: 0, rotateY: 0 };
    return normal;
  };

  return {
    shouldReduce,
    safe,
    springs: shouldReduce
      ? {
          snappy: { duration: 0.01 },
          smooth: { duration: 0.01 },
          bounceless: { duration: 0.01 },
          gentle: { duration: 0.01 },
          tactile: { duration: 0.01 }
        }
      : springs,
    getTransition
  };
}
