import * as React from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-sm bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export default Input;
