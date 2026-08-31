import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  Folder01Icon,
  PaintBucketIcon,
  Layers01Icon,
  Settings02Icon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons';
import { useGuardianAvatars } from '../data/avatar.queries';

interface AvatarStudioShellProps {
  children: React.ReactNode;
  activeTab?: 'library' | 'projects' | 'creator' | 'variants' | 'settings';
}

export const AvatarStudioShell: React.FC<AvatarStudioShellProps> = ({
  children,
  activeTab,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: avatars = [] } = useGuardianAvatars();

  const totalCount = avatars.length;
  const assignedCount = avatars.filter((a) => a.isAssigned).length;

  // Determine active route for tab styling
  const currentPath = location.pathname;
  const isLibraryActive = activeTab === 'library' || currentPath === '/app/avatar-studio' || currentPath === '/avatar-studio';
  const isProjectsActive = activeTab === 'projects' || currentPath.includes('/avatar-studio/projects');
  const isCreatorActive = activeTab === 'creator' || currentPath.includes('/avatar-studio/create') || currentPath.includes('/edit');
  const isVariantsActive = activeTab === 'variants' || currentPath.includes('/avatar-studio/variants');
  const isSettingsActive = activeTab === 'settings' || currentPath.includes('/avatar-studio/settings');

  return (
    <div className="w-full space-y-5 text-white font-mono select-none">
      {/* Studio Top Header - Fully Responsive Layout */}
      <div className="border-b border-zinc-850 pb-4 space-y-3.5 w-full">
        {/* Top Row: Brand & Action Button */}
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-sm bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm shadow-cyan-950/40">
              <HugeiconsIcon icon={SparklesIcon} size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-black tracking-tight text-white truncate">
                  Avatar Studio
                </h1>
                <span className="px-1.5 sm:px-2 py-0.2 rounded text-[9.5px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 shrink-0">
                  PRO ENGINE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans truncate hidden sm:block">
                Manage 3D Guardian identities, project bindings, and public portal appearances.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/avatar-studio/create')}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={14} />
            <span className="hidden xs:inline">New Guardian</span>
            <span className="xs:hidden">New</span>
          </button>
        </div>

        {/* Bottom Row: Sub-Navigation Horizontal Scrollable Bar */}
        <div className="w-full overflow-x-auto custom-scrollbar pb-1">
          <nav className="inline-flex items-center gap-1 bg-zinc-900/90 p-1 rounded-sm border border-zinc-800 flex-nowrap min-w-full sm:min-w-0">
            <NavLink
              to="/app/avatar-studio"
              end
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-sm text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                isLibraryActive
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
              }`}
            >
              <HugeiconsIcon icon={Layers01Icon} size={13} />
              <span>Library</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-950 border border-zinc-700/60 text-zinc-300">
                {totalCount}
              </span>
            </NavLink>

            <NavLink
              to="/app/avatar-studio/projects"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-sm text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                isProjectsActive
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
              }`}
            >
              <HugeiconsIcon icon={Folder01Icon} size={13} />
              <span>Projects</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-950 border border-zinc-700/60 text-emerald-400">
                {assignedCount}
              </span>
            </NavLink>

            <NavLink
              to="/app/avatar-studio/create"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-sm text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                isCreatorActive
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-sm shadow-cyan-950/30'
                  : 'text-zinc-400 hover:text-cyan-300 hover:bg-zinc-850/50'
              }`}
            >
              <HugeiconsIcon icon={PaintBucketIcon} size={13} className={isCreatorActive ? 'text-cyan-400' : ''} />
              <span>Guardian Creator</span>
            </NavLink>

            <NavLink
              to="/app/avatar-studio/variants"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-sm text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                isVariantsActive
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
              }`}
            >
              <HugeiconsIcon icon={SparklesIcon} size={13} />
              <span>Variants</span>
            </NavLink>

            <NavLink
              to="/app/avatar-studio/settings"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-sm text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                isSettingsActive
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
              }`}
            >
              <HugeiconsIcon icon={Settings02Icon} size={13} />
              <span>Settings</span>
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Main Studio Viewport Content */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};

export default AvatarStudioShell;
