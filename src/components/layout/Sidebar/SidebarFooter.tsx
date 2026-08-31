import React from 'react';
import { useAuthSession } from '../../../modules/auth/auth-hooks';

interface SidebarFooterProps {
  isCollapsed: boolean;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ isCollapsed }) => {
  const { user } = useAuthSession();

  const userEmail = user?.email ?? 'admin@bunker.studio';
  const userName = user?.user_metadata?.full_name ?? 'Eswar Chinthakayala';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="p-3 border-t border-zinc-800/80 shrink-0">
      <div
        className={`flex items-center gap-3 p-2 rounded-sm bg-zinc-900/60 border border-zinc-800/60 backdrop-blur-md ${isCollapsed ? 'justify-center p-1.5' : ''
          }`}
      >
        <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700/80 flex items-center justify-center text-xs font-mono font-bold text-white shrink-0 shadow-md">
          {userInitials}
        </div>

        {!isCollapsed && (
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className="text-xs font-semibold text-white truncate tracking-tight">
              {userName}
            </span>
            <span className="text-[10px] text-zinc-400 truncate font-mono">
              {userEmail}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarFooter;
