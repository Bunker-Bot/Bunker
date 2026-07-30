import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';

interface SidebarItemProps {
  to: string;
  label: string;
  icon: any;
  isCollapsed: boolean;
  badge?: string | number;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  to,
  label,
  icon,
  isCollapsed,
  badge,
  onClick,
}) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `relative group flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 select-none ${
          isActive
            ? 'bg-zinc-800/80 border border-zinc-700/80 text-white shadow-lg backdrop-blur-md'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 hover:border-zinc-800/60 hover:-translate-y-0.5 border border-transparent'
        } ${isCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'w-full'}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="activeNavIndicator"
              className="absolute left-0 w-1 h-5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}

          <HugeiconsIcon
            icon={icon}
            size={18}
            className={`shrink-0 transition-transform duration-150 group-hover:scale-105 ${
              isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'
            }`}
          />

          {!isCollapsed && (
            <span className="truncate flex-1 tracking-tight">
              {label}
            </span>
          )}

          {!isCollapsed && badge !== undefined && (
            <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              {badge}
            </span>
          )}

          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 whitespace-nowrap z-50">
              {label}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
};

export default SidebarItem;
