import React from 'react';
import { SidebarItem } from './SidebarItem';
import {
  DashboardSquare01Icon,
  FolderCheckIcon,
  UserGroupIcon,
  Clock01Icon,
  Task01Icon,
  GitBranchIcon,
  FileCodeIcon,
  Share01Icon,
  Link01Icon,
  Activity01Icon,
  Notification01Icon,
  Analytics01Icon,
  Settings01Icon,
  User02Icon,
} from '@hugeicons/core-free-icons';

interface SidebarNavProps {
  isCollapsed: boolean;
  onItemClick?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  isCollapsed,
  onItemClick,
}) => {
  const workspaceItems = [
    { to: '/app/dashboard', label: 'Dashboard', icon: DashboardSquare01Icon },
    { to: '/app/projects', label: 'Projects', icon: FolderCheckIcon },
    { to: '/app/clients', label: 'Clients', icon: UserGroupIcon },
    { to: '/app/timeline', label: 'Timeline', icon: Clock01Icon },
    { to: '/app/tasks', label: 'Tasks', icon: Task01Icon },
    { to: '/app/github', label: 'Repositories', icon: GitBranchIcon },
    { to: '/app/docs', label: 'Documents', icon: FileCodeIcon },
    { to: '/app/client-portal', label: 'Client Portals', icon: Share01Icon },
  ];

  const managementItems = [
    { to: '/app/share-links', label: 'Share Links', icon: Link01Icon },
    { to: '/app/activity', label: 'Activity', icon: Activity01Icon },
    { to: '/app/notifications', label: 'Notifications', icon: Notification01Icon, badge: 3 },
    { to: '/app/analytics', label: 'Analytics', icon: Analytics01Icon },
    { to: '/app/settings', label: 'Settings', icon: Settings01Icon },
    { to: '/app/profile', label: 'Profile', icon: User02Icon },
  ];

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
      <div className="space-y-1">
        {!isCollapsed && (
          <h3 className="px-3 text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Workspace
          </h3>
        )}
        <nav className="space-y-1">
          {workspaceItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              isCollapsed={isCollapsed}
              onClick={onItemClick}
            />
          ))}
        </nav>
      </div>

      <div className="space-y-1">
        {!isCollapsed && (
          <h3 className="px-3 text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Management
          </h3>
        )}
        <nav className="space-y-1">
          {managementItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              isCollapsed={isCollapsed}
              badge={item.badge}
              onClick={onItemClick}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SidebarNav;
