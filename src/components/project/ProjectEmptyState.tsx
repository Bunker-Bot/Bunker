import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Folder01Icon } from '@hugeicons/core-free-icons';

export interface ProjectEmptyStateProps {
  title: string;
  description?: string;
  icon?: any;
  action?: React.ReactNode;
  className?: string;
}

export const ProjectEmptyState: React.FC<ProjectEmptyStateProps> = ({
  title,
  description,
  icon = Folder01Icon,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-sm bg-zinc-950/60 border border-dashed border-zinc-800/80 text-zinc-400 font-mono text-xs space-y-3 select-none ${className}`}>
      <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
        <HugeiconsIcon icon={icon} size={22} />
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-white text-sm">{title}</h4>
        {description && <p className="text-zinc-500 text-xs max-w-sm">{description}</p>}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

export default ProjectEmptyState;
