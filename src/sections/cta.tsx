import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  LockKeyIcon,
  BookOpen01Icon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';
import { HeroSignatureBackground } from '../components/landing/HeroSignatureBackground';

export const CtaSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="cta" className="scroll-mt-20 relative w-full py-28 border-t border-zinc-800/80 bg-[#050505] overflow-hidden">

      {/* Signature Bunker Monochrome Architectural Background */}
      <HeroSignatureBackground />

      {/* Main Interactive Container */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-12 w-full">

        {/* Floating Centered Liquid Glass Panel */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="relative max-w-5xl mx-auto p-10 sm:p-16 lg:p-20 bg-[rgba(15,15,18,0.92)] border border-zinc-800/90 rounded-sm backdrop-blur-2xl shadow-2xl text-center space-y-8 overflow-hidden"
        >
          {/* Subtle Inner Top Gradient Highlight Line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent rounded-t-lg pointer-events-none" />

          {/* Section Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl text-xs text-zinc-300 shadow-xl">
            <HugeiconsIcon icon={SparklesIcon} size={14} className="text-zinc-300 animate-pulse" />
            <span className="font-medium">Bunker Workspace</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] max-w-3xl mx-auto">
            Build projects your clients{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              love following.
            </span>
          </h2>

          {/* Supporting Description */}
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Bunker helps freelancers deliver a professional client experience through secure portals, timelines, GitHub integration, living documentation, and complete project transparency.
          </p>

          {/* Action Buttons Row */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">

            {/* Primary Button */}
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white hover:bg-zinc-200 text-black font-bold rounded-sm text-sm transition-all duration-200 shadow-xl cursor-pointer hover:scale-[1.01]"
            >
              <HugeiconsIcon icon={LockKeyIcon} size={18} />
              <span>Admin Login</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </button>

            {/* Secondary Button */}
            <button
              onClick={() => navigate('/docs')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-white font-medium rounded-sm text-sm transition-all duration-200 backdrop-blur-xl shadow-lg cursor-pointer hover:scale-[1.01]"
            >
              <HugeiconsIcon icon={BookOpen01Icon} size={18} />
              <span>Read Documentation</span>
            </button>

          </div>

          {/* Subtle Bottom Trust Note */}
          <div className="pt-2 text-xs font-mono text-zinc-500">
            PostgreSQL RLS Protected &bull; Single-Owner Admin System &bull; Zero Signup Required for Clients
          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default CtaSection;
