import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNav } from './SidebarNav';
import { SidebarFooter } from './SidebarFooter';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          />

          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#0c0c0e] border-r border-zinc-800/80 z-50 flex flex-col lg:hidden"
          >
            <SidebarHeader isCollapsed={false} onToggleCollapse={onClose} />
            <SidebarNav isCollapsed={false} onItemClick={onClose} />
            <SidebarFooter isCollapsed={false} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
