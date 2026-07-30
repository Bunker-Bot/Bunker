import React from 'react';
import { motion } from 'framer-motion';
import { SidebarProvider, SidebarInset } from '../ui/sidebar';
import { AppSidebar } from '../app-sidebar';
import { Header } from './Header';
import type { ViewMode, NotificationItem } from '../../types';
import { useAppearanceSettings } from '../../modules/settings/hooks/useSettings';
import { cn } from '../../lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenCreateProject: () => void;
  notifications?: NotificationItem[];
  onLogout?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentView,
  onSelectView,
  onOpenCreateProject,
  onLogout
}) => {
  const { data: appearance } = useAppearanceSettings();

  const sidebarWidthValue = appearance?.sidebarWidth === 'compact' ? '14rem' : '16rem';

  return (
    <SidebarProvider
      style={{
        '--sidebar-width': sidebarWidthValue,
      } as React.CSSProperties}
    >
      <div
        className={cn(
          "h-screen w-full text-[#FAFAFA] relative font-sans flex overflow-hidden selection:bg-zinc-800 selection:text-white transition-all duration-200",
          appearance?.theme === 'dark' ? 'bg-[#080809]' : 'bg-[#050505]',
          appearance?.compactMode && 'compact-mode',
          appearance?.reducedMotion && 'reduced-motion'
        )}
      >
        <AppSidebar
          currentView={currentView}
          onSelectView={onSelectView}
          onOpenCreateProject={onOpenCreateProject}
          onLogout={onLogout}
        />

        <SidebarInset className="relative z-10 flex-1 h-screen max-h-screen flex flex-col overflow-hidden bg-transparent p-0 m-0 border-none shadow-none">
          <Header
            currentView={currentView}
            onOpenCommandMenu={() => {}}
            onOpenCreateProject={onOpenCreateProject}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-16">
            <motion.div
              key={currentView}
              initial={appearance?.animationsEnabled !== false ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={appearance?.animationsEnabled !== false ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
