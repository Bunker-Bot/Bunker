import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { SecurityCheckIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { AppLogo } from '../ui/AppLogo';

interface LandingHeaderProps {
  onOpenAdminLogin?: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onOpenAdminLogin
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-2xl bg-[rgba(10,10,12,0.85)] border-b border-zinc-800/80 shadow-2xl transition-all">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 w-full h-16 flex items-center justify-between">

        {/* Brand Logo & Nav */}
        <div className="flex items-center gap-10">
          <a href="#hero" className="inline-flex items-center group">
            <AppLogo size={34} showText={true} />
          </a>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#portal-showcase" className="hover:text-white transition-colors">Client Portals</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          </nav>
        </div>

        {/* Single Primary Action CTA: Admin Login */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAdminLogin}
            className="text-xs bg-white hover:bg-zinc-200 text-black font-semibold px-4 py-2 rounded-sm transition-all shadow-lg cursor-pointer flex items-center gap-2 hover:scale-[1.01]"
          >
            <HugeiconsIcon icon={SecurityCheckIcon} size={15} />
            <span>Admin Login</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </button>
        </div>

      </div>
    </header>
  );
};

export default LandingHeader;
