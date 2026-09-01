import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  LockKeyIcon,
  ArrowRight01Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons';

interface PortalEntryPasswordModalProps {
  onSubmit: (password: string) => void;
  error?: string | null;
  isLoading?: boolean;
}

export const PortalEntryPasswordModal: React.FC<PortalEntryPasswordModalProps> = ({
  onSubmit,
  error,
  isLoading = false,
}) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isLoading) return;
    onSubmit(password.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-sm mx-auto space-y-4 font-mono select-none"
    >
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-zinc-900 border border-zinc-800 text-cyan-400 text-[10.5px] uppercase font-bold tracking-wider">
          <HugeiconsIcon icon={LockKeyIcon} size={13} />
          <span>Protected Project Vault</span>
        </div>
        <p className="text-xs text-zinc-400 font-sans pt-1">
          Passcode authentication is required to access this workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter access passcode..."
            className="w-full px-4 py-2.5 rounded-sm bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-center tracking-widest"
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-1.5 text-rose-400 text-[11px] font-sans"
          >
            <HugeiconsIcon icon={AlertCircleIcon} size={13} />
            <span>{error}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={!password.trim() || isLoading}
          className="w-full py-2.5 px-4 rounded-sm bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <span>{isLoading ? 'Verifying...' : 'Unlock Portal'}</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
        </button>
      </form>
    </motion.div>
  );
};

export default PortalEntryPasswordModal;
