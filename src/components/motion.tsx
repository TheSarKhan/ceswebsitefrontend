'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

type CommonProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Reveal({
  children,
  delay = 0,
  y = 24,
  as = 'div',
  className,
  style,
}: CommonProps & { delay?: number; y?: number; as?: keyof typeof motion }) {
  const reduce = useReducedMotion();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag: any = motion[as] ?? motion.div;
  if (reduce) {
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }
  return (
    <Tag
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}

export function StaggerGroup({
  children,
  className,
  style,
  stagger = 0.08,
  delay = 0,
}: CommonProps & { stagger?: number; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce)
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px 0px' }}
      variants={{
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  style,
  y = 20,
}: CommonProps & { y?: number }) {
  const reduce = useReducedMotion();
  if (reduce)
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export { motion };
