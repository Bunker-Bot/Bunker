import React from 'react';
import { motion } from 'framer-motion';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNav } from './SidebarNav';
import { SidebarFooter } from './SidebarFooter';
import { useLayoutStore } from '../../../stores/useLayoutStore';

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useLayoutStore();

  return (
    <motion.aside
      animate={{ width: isSidebarCollapsed ? 80 : 280 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed top-4 left-4 bottom-4 z-30 hidden lg:flex flex-col bg-[rgba(17,17,19,0.85)] border border-zinc-800/80 rounded-lg backdrop-blur-2xl shadow-2xl overflow-hidden select-none"
    >
      <SidebarHeader
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      <SidebarNav isCollapsed={isSidebarCollapsed} />
      <SidebarFooter isCollapsed={isSidebarCollapsed} />
    </motion.aside>
  );
};

export default Sidebar;
