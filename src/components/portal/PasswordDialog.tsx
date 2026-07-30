import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { LockKeyIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { AppLogo } from '../ui/AppLogo';
import { RadialSpinner } from '../ui/RadialSpinner';

interface PasswordDialogProps {
  onSubmit: (password: string) => void;
  error?: string | null;
  isLoading?: boolean;
}

export const PasswordDialog: React.FC<PasswordDialogProps> = ({
  onSubmit,
  error,
  isLoading
}) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Ambient Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.08),transparent_70%)] pointer-events-none" />
      {/* Grid Dots Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-zinc-950/90 border border-zinc-800/80 rounded-sm p-8 backdrop-blur-2xl shadow-2xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <AppLogo size={44} showText={false} />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Protected Client Portal
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            This project portal is password protected. Enter the access password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <HugeiconsIcon icon={LockKeyIcon} size={16} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter portal password"
              className="w-full pl-10 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/60 rounded-sm text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-mono"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-sm p-2.5 text-center font-sans">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-zinc-200 text-black font-semibold rounded-sm text-sm transition-all disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {isLoading ? (
              <>
                <RadialSpinner size={16} className="text-black" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Unlock Portal</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordDialog;
