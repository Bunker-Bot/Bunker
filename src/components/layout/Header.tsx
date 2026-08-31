import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Add01Icon,
  Notification01Icon,
  CommandIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { SidebarTrigger } from '../ui/sidebar';
import type { ViewMode } from '../../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface HeaderProps {
  onOpenCommandMenu: () => void;
  onOpenCreateProject: () => void;
  currentView?: ViewMode;
}

const VIEW_TITLES: Record<ViewMode, string> = {
  dashboard: 'Dashboard Overview',
  projects: 'Client Projects',
  clients: 'Client Management',
  'avatar-studio': 'Avatar Studio',
  tasks: 'Tasks & Kanban',
  milestones: 'Project Milestones',
  github: 'GitHub Developer Hub',
  docs: 'Documentation & Specs',
  files: 'Files & Credentials Vault',
  timeline: 'Timelines & Roadmap',
  client_portal: 'Client Portals',
  'share-links': 'Share Links & Access',
  payments: 'Finances & Deliverables',
  changelog: 'Project Changelog & Releases',
  notes: 'Private Admin Notes',
  deployments: 'Deployments & Environments',
  notifications: 'Notification Center',
  settings: 'System Settings',
};

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandMenu,
  onOpenCreateProject,
  currentView = 'dashboard',
}) => {
  const navigate = useNavigate();
  const [isBellOpen, setIsBellOpen] = useState(false);

  const currentTitle = VIEW_TITLES[currentView] || 'Workspace';

  return (
    <header className="h-14 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,12,0.8)] backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 transition-all select-none font-mono">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <SidebarTrigger className="text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0" />
        <div className="h-4 w-[1px] bg-zinc-800 shrink-0" />
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="text-xs font-mono text-zinc-400 flex-nowrap">
            <BreadcrumbItem className="hidden sm:inline-flex">
              <BreadcrumbLink href="#" className="hover:text-white transition-colors whitespace-nowrap">
                Bunker Studio Pro
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:inline-flex text-zinc-600 shrink-0" />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="font-semibold text-white truncate max-w-[130px] sm:max-w-none">
                {currentTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenCommandMenu}
          className="h-8 w-8 sm:w-auto px-0 sm:px-3 rounded-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] text-zinc-400 hover:text-zinc-200 text-xs font-mono flex items-center justify-center sm:justify-start gap-2.5 transition-all cursor-pointer shadow-inner shrink-0"
          title="Search or command (Ctrl+K)"
        >
          <HugeiconsIcon icon={Search01Icon} size={15} className="text-zinc-400 shrink-0" />
          <span className="hidden sm:inline">Search or command...</span>
          <kbd className="hidden md:flex items-center gap-0.5 text-[10px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-sans">
            <HugeiconsIcon icon={CommandIcon} size={10} />
            <span>K</span>
          </kbd>
        </button>

        <button
          type="button"
          onClick={onOpenCreateProject}
          className="h-8 w-8 sm:w-auto px-0 sm:px-3 rounded-sm bg-[#FAFAFA] text-[#050505] hover:bg-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,255,255,0.15)] border border-white/20 shrink-0"
          title="New Project"
        >
          <HugeiconsIcon icon={Add01Icon} size={15} className="shrink-0" />
          <span className="hidden sm:inline">New Project</span>
        </button>

        <div className="relative shrink-0">
          <DropdownMenu open={isBellOpen} onOpenChange={setIsBellOpen}>
            <DropdownMenuTrigger
              nativeButton={true}
              render={
                <button
                  type="button"
                  className="w-8 h-8 rounded-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer relative"
                  title="Notifications"
                >
                  <HugeiconsIcon icon={Notification01Icon} size={16} />
                </button>
              }
            />

            <DropdownMenuContent
              align="end"
              className="w-80 p-0 bg-[rgba(12,12,14,0.96)] backdrop-blur-2xl border border-[rgba(255,255,255,0.1)] rounded-sm shadow-2xl text-xs font-mono overflow-hidden"
            >
              <div className="flex items-center justify-between p-3 border-b border-zinc-800/80 bg-zinc-950/60">
                <span className="font-bold text-white font-sans">Notifications</span>
              </div>

              <div className="p-6 text-center text-zinc-500 font-mono text-xs">
                No new notifications
              </div>

              <div className="p-2 border-t border-zinc-800/80 bg-zinc-950/80 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/app/notifications')}
                  className="w-full py-1.5 text-xs text-zinc-300 hover:text-white font-mono inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View Notifications</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
