import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  InformationCircleIcon,
  HelpCircleIcon,
  AlertCircleIcon,
  SecurityIcon,
} from '@hugeicons/core-free-icons';

export type AlertType = 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION';

interface GitHubAlertProps {
  type: AlertType;
  content: string;
}

export const GitHubAlert: React.FC<GitHubAlertProps> = ({ type, content }) => {
  const getAlertConfig = (type: AlertType) => {
    switch (type) {
      case 'NOTE':
        return {
          icon: InformationCircleIcon,
          title: 'Note',
          classes: 'bg-sky-950/40 text-sky-300 border-sky-800/60',
          iconColor: 'text-sky-400',
        };
      case 'TIP':
        return {
          icon: HelpCircleIcon,
          title: 'Tip',
          classes: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60',
          iconColor: 'text-emerald-400',
        };
      case 'IMPORTANT':
        return {
          icon: SecurityIcon,
          title: 'Important',
          classes: 'bg-purple-950/40 text-purple-300 border-purple-800/60',
          iconColor: 'text-purple-400',
        };
      case 'WARNING':
        return {
          icon: AlertCircleIcon,
          title: 'Warning',
          classes: 'bg-amber-950/40 text-amber-300 border-amber-800/60',
          iconColor: 'text-amber-400',
        };
      case 'CAUTION':
        return {
          icon: AlertCircleIcon,
          title: 'Caution',
          classes: 'bg-rose-950/40 text-rose-300 border-rose-800/60',
          iconColor: 'text-rose-400',
        };
      default:
        return {
          icon: InformationCircleIcon,
          title: 'Note',
          classes: 'bg-zinc-900/80 text-zinc-300 border-zinc-800',
          iconColor: 'text-zinc-400',
        };
    }
  };

  const config = getAlertConfig(type);

  return (
    <div className={`p-4 my-4 rounded-xl border backdrop-blur-xl space-y-1 select-none ${config.classes}`}>
      <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
        <HugeiconsIcon icon={config.icon} size={16} className={config.iconColor} />
        <span>{config.title}</span>
      </div>
      <div className="text-xs font-normal leading-relaxed pl-6 text-zinc-200">
        {content}
      </div>
    </div>
  );
};

export default GitHubAlert;
