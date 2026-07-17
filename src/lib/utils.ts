import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * text-fluid-* must not collide with text-{color} (e.g. text-primary-foreground).
 * Default twMerge treats all text-* as the same group and drops the color.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: ['fluid-xs', 'fluid-sm', 'fluid-base', 'fluid-lg', 'fluid-xl', 'fluid-2xl', 'fluid-3xl', 'fluid-display', 'display'],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
