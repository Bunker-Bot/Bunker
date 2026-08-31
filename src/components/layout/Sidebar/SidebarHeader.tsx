import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLogo } from '../../ui/AppLogo';
import { HugeiconsIcon } from '@hugeicons/react';
import { SidebarLeftIcon } from '@hugeicons/core-free-icons';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 shrink-0">
      <div className="flex items-center gap-3 overflow-hidden">
        <AppLogo size={32} showText={false} animated />

        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex flex-col whitespace-nowrap overflow-hidden"
            >
              <span className="text-sm font-bold text-white tracking-tight leading-none">
                Bunker
              </span>
              <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                Workspace
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="p-1.5 rounded-sm text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer border border-transparent hover:border-zinc-700/60 shrink-0"
      >
        <HugeiconsIcon
          icon={SidebarLeftIcon}
          size={18}
          className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );
};

export default SidebarHeader;
