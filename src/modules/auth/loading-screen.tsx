import React from 'react';
import { AppLogo } from '../../components/ui/AppLogo';
import { motion } from 'framer-motion';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-white select-none">
      <div className="flex flex-col items-center space-y-4">
        <AppLogo size={52} animated showText={false} />

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="flex flex-col items-center space-y-1 font-mono"
        >
          <span className="text-xs font-bold tracking-widest uppercase text-white">
            Bunker
          </span>
          <span className="text-[11px] text-zinc-500 font-normal">
            Restoring secure admin session...
          </span>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;
