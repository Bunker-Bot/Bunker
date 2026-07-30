import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PlusSignIcon,
  UserGroupIcon,
  Link01Icon,
  GithubIcon,
  Clock01Icon,
  FileCodeIcon,
  Download01Icon,
  Settings02Icon
} from '@hugeicons/core-free-icons';

interface DashboardQuickActionsProps {
  onOpenNewProject: () => void;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  onOpenNewProject,
}) => {
  const navigate = useNavigate();

  const actions = [
    { label: 'Create Project', icon: PlusSignIcon, action: onOpenNewProject, color: 'text-white' },
    { label: 'Create Client', icon: UserGroupIcon, action: () => navigate('/app/clients'), color: 'text-purple-400' },
    { label: 'Share Link', icon: Link01Icon, action: () => navigate('/app/share'), color: 'text-cyan-400' },
    { label: 'Sync GitHub', icon: GithubIcon, action: () => navigate('/app/github'), color: 'text-emerald-400' },
    { label: 'Timeline Update', icon: Clock01Icon, action: () => navigate('/app/timeline'), color: 'text-amber-400' },
    { label: 'Documentation', icon: FileCodeIcon, action: () => navigate('/app/documentation'), color: 'text-purple-400' },
    { label: 'Export Workspace', icon: Download01Icon, action: () => navigate('/app/projects'), color: 'text-cyan-400' },
    { label: 'Settings', icon: Settings02Icon, action: () => navigate('/app/settings'), color: 'text-zinc-400' },
  ];

  return (
    <div className="p-3.5 rounded-sm bg-zinc-900/90 border border-zinc-800/80 shadow-md font-mono select-none space-y-2.5">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Command Shortcuts</span>
        <span className="text-[10px] text-zinc-500 font-bold">Quick Actions</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {actions.map((act, idx) => (
          <motion.button
            key={act.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02 }}
            onClick={act.action}
            className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm text-left group"
          >
            <HugeiconsIcon icon={act.icon} size={14} className={`${act.color} group-hover:scale-110 transition-transform shrink-0`} />
            <span className="text-[11px] font-bold truncate">{act.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
