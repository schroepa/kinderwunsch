import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-geist',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'h-10 min-h-10 rounded-lg px-4 text-fluid-sm': size === 'default',
            'h-9 min-h-9 rounded-md px-3 text-fluid-xs': size === 'sm',
            'h-11 min-h-11 rounded-xl px-6 text-fluid-base': size === 'lg',
            'h-10 w-10 min-h-10 min-w-10 rounded-lg': size === 'icon',
          },
          // Color classes AFTER size so even without twMerge extend they win
          {
            'bg-primary text-primary-foreground shadow-soft hover:bg-primary/90':
              variant === 'default',
            'bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90':
              variant === 'destructive',
            'border border-border bg-card text-foreground shadow-soft hover:bg-accent':
              variant === 'outline' || variant === 'secondary',
            'text-foreground hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
            'text-primary underline-offset-4 hover:underline': variant === 'link',
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
