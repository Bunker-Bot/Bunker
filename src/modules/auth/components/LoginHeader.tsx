import React from 'react';
import { motion } from 'framer-motion';
import { AppLogo } from '../../../components/ui/AppLogo';

export const LoginHeader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center text-center space-y-3"
    >
      <div className="p-2 rounded-sm bg-zinc-900/60 border border-zinc-800/80 shadow-md">
        <AppLogo size={44} showText={false} animated />
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
          Welcome Back
        </h1>
        <p className="text-xs text-zinc-400 max-w-xs leading-relaxed font-normal">
          Sign in to access your workspace, projects, and client portal management.
        </p>
      </div>
    </motion.div>
  );
};

export default LoginHeader;
