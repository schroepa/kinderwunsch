import { motion, type HTMLMotionProps } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type AnimatedIconProps = HTMLMotionProps<'span'> & {
  icon: LucideIcon;
  size?: number;
  strokeWidth?: number;
};

const geistTransition = { duration: 0.15, ease: [0.175, 0.885, 0.32, 1.1] as const };

export function AnimatedIcon({
  icon: Icon,
  size = 20,
  strokeWidth = 1.75,
  className,
  ...props
}: AnimatedIconProps) {
  return (
    <motion.span
      className={cn('inline-flex shrink-0 text-current', className)}
      whileHover={{ opacity: 0.8 }}
      transition={geistTransition}
      {...props}
    >
      <Icon size={size} strokeWidth={strokeWidth} aria-hidden />
    </motion.span>
  );
}

export function AnimatedDrawIcon({
  icon: Icon,
  size = 20,
  strokeWidth = 1.75,
  className,
  ...props
}: AnimatedIconProps) {
  return (
    <motion.span
      className={cn('inline-flex shrink-0 text-current', className)}
      whileHover={{ x: -2 }}
      transition={geistTransition}
      {...props}
    >
      <Icon size={size} strokeWidth={strokeWidth} aria-hidden />
    </motion.span>
  );
}

/** Static icon — Geist uses minimal motion; pulse removed. */
export function AnimatedPulseIcon({
  icon: Icon,
  size = 20,
  strokeWidth = 1.75,
  className,
}: Pick<AnimatedIconProps, 'icon' | 'size' | 'strokeWidth' | 'className'>) {
  return (
    <span className={cn('inline-flex shrink-0 text-current', className)}>
      <Icon size={size} strokeWidth={strokeWidth} aria-hidden />
    </span>
  );
}
