import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon, Home01Icon } from '@hugeicons/core-free-icons';
import { AppLogo } from '../../components/ui/AppLogo';
import { AuthBackground } from '../../modules/auth/components/AuthBackground';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#050505] flex items-center justify-center p-4 overflow-hidden select-none">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-md bg-[rgba(17,17,19,0.88)] border border-zinc-800/80 rounded-lg p-8 backdrop-blur-2xl text-center space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-md">
            <HugeiconsIcon icon={AlertCircleIcon} size={24} />
          </div>
          <AppLogo size={36} showText={false} animated />
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            404 — Page Not Found
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
            The page or module you are looking for does not exist or has been moved.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs transition-all cursor-pointer shadow-lg active:scale-[0.99]"
        >
          <HugeiconsIcon icon={Home01Icon} size={16} />
          Back to Homepage
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
