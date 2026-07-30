import * as React from 'react';
import { cn } from '../lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-sm bg-zinc-950/60 border border-dashed border-zinc-800/80 text-zinc-400 font-mono text-xs space-y-3 select-none',
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <h4 className="font-bold text-white text-sm">{title}</h4>
        {description && <p className="text-zinc-500 text-xs max-w-sm">{description}</p>}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export default EmptyState;
