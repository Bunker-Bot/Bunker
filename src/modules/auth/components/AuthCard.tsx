import React from 'react';
import { motion } from 'framer-motion';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`relative z-10 w-full max-w-[420px] bg-[rgba(17,17,19,0.88)] border border-zinc-800/80 rounded-sm p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default AuthCard;
