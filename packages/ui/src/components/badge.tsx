import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-semibold font-mono uppercase tracking-wider transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'bg-zinc-800 text-zinc-300 border border-zinc-700/60',
        completed: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80',
        active: 'bg-blue-950/80 text-blue-300 border border-blue-800/80',
        planning: 'bg-slate-900 text-slate-300 border border-slate-700/80',
        review: 'bg-purple-950/80 text-purple-300 border border-purple-800/80',
        testing: 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80',
        warning: 'bg-amber-950/80 text-amber-300 border border-amber-800/80',
        urgent: 'bg-rose-950/80 text-rose-300 border border-rose-800/80',
        error: 'bg-red-950/80 text-red-300 border border-red-800/80',
        cancelled: 'bg-zinc-900 text-zinc-400 border border-zinc-800',
        outline: 'bg-transparent text-zinc-400 border border-zinc-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export default Badge;
