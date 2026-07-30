import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-xs font-semibold font-mono transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-white text-black hover:bg-zinc-200 shadow-sm active:scale-[0.98]',
        secondary: 'bg-zinc-900 text-zinc-100 border border-zinc-800 hover:bg-zinc-800 hover:text-white',
        outline: 'bg-transparent text-zinc-200 border border-zinc-800 hover:bg-zinc-900 hover:text-white hover:border-zinc-700',
        ghost: 'bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100',
        destructive: 'bg-zinc-900 text-rose-400 border border-rose-900/50 hover:bg-rose-950/40 hover:text-rose-300',
        link: 'text-zinc-300 underline-offset-4 hover:underline hover:text-white p-0 h-auto',
      },
      size: {
        xs: 'h-7 px-2.5 text-[11px]',
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-xs',
        lg: 'h-10 px-5 text-sm',
        icon: 'h-8 w-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-1.5">
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';
export default Button;
