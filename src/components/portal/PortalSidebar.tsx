import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { LockKeyIcon, ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { PORTAL_ALL_MODULES } from './PortalHeader';

interface PortalSidebarProps {
  allowedModules: string[];
  activeModule: string;
  onSelectModule: (id: string) => void;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  allowedModules,
  activeModule,
  onSelectModule,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const visibleModules = PORTAL_ALL_MODULES.filter((m) =>
    allowedModules.length === 0 || allowedModules.includes(m.id) || allowedModules.includes('all')
  );

  return (
    <aside
      className={`fixed left-0 top-[72px] bottom-0 z-30 bg-[#09090b]/95 border-r border-zinc-800/90 backdrop-blur-xl transition-all duration-300 font-mono select-none flex flex-col justify-between hidden lg:flex ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Top Module Links */}
      <div className="p-3 space-y-3 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between px-2 text-zinc-500">
          {!isCollapsed && <span className="text-[10px] uppercase font-bold tracking-wider">Shared Modules</span>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <HugeiconsIcon icon={isCollapsed ? ArrowRight01Icon : ArrowLeft01Icon} size={15} />
          </button>
        </div>

        <nav className="space-y-1">
          {visibleModules.map((mod) => {
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-850 text-white border border-zinc-750 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={mod.label}
              >
                <HugeiconsIcon
                  icon={mod.icon}
                  size={16}
                  className={isActive ? 'text-cyan-400' : 'text-zinc-500'}
                />
                {!isCollapsed && <span>{mod.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding */}
      <div className="p-3 border-t border-zinc-850 text-[10px] text-zinc-500 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-zinc-400">
          <HugeiconsIcon icon={LockKeyIcon} size={12} className="text-emerald-400" />
          {!isCollapsed && <span>Protected Share</span>}
        </div>
        {!isCollapsed && (
          <p className="text-[9px] font-sans leading-tight text-zinc-500">
            Read Only Verified Access • Powered by Bunker
          </p>
        )}
      </div>
    </aside>
  );
};
