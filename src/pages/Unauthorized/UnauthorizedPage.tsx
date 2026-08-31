import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { SecurityCheckIcon, LockKeyIcon } from '@hugeicons/core-free-icons';
import { AppLogo } from '../../components/ui/AppLogo';
import { AuthBackground } from '../../modules/auth/components/AuthBackground';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#050505] flex items-center justify-center p-4 overflow-hidden select-none">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-md bg-[rgba(17,17,19,0.88)] border border-zinc-800/80 rounded-sm p-8 backdrop-blur-2xl text-center space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-sm bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-md">
            <HugeiconsIcon icon={SecurityCheckIcon} size={24} />
          </div>
          <AppLogo size={36} showText={false} animated />
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            403 — Unauthorized Access
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
            You do not have permission to view this resource. Admin sign in is required.
          </p>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-zinc-200 text-black font-semibold rounded-sm text-xs transition-all cursor-pointer shadow-lg active:scale-[0.99]"
        >
          <HugeiconsIcon icon={LockKeyIcon} size={16} />
          Admin Login
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
