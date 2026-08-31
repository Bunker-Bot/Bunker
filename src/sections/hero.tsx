import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  SparklesIcon,
  SecurityCheckIcon,
  PlayIcon
} from '@hugeicons/core-free-icons';
import { ProductPreviewShowcase } from '../components/landing/ProductPreviewShowcase';
import { HeroSignatureBackground } from '../components/landing/HeroSignatureBackground';

interface HeroSectionProps {
  onAdminLogin?: () => void;
  onStartFree?: () => void;
  onSeeAction?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onAdminLogin,
  onStartFree,
  onSeeAction
}) => {
  const handlePrimaryClick = onAdminLogin || onStartFree;

  return (
    <section id="hero" className="scroll-mt-20 relative w-full min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 sm:py-16 lg:py-24 overflow-hidden bg-[#050505]">

      {/* Signature Bunker Architectural Monochrome Background */}
      <HeroSignatureBackground />

      {/* Hero Interactive Content Layer */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Headline, Copy & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:col-span-6 space-y-5 sm:space-y-6 text-left"
          >
            {/* Announcement Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl text-xs text-zinc-300 shadow-xl"
            >
              <HugeiconsIcon icon={SparklesIcon} size={14} className="text-zinc-300 animate-pulse" />
              <span className="font-medium">Built for Modern Freelancers & Agencies</span>
            </motion.div>

            {/* Dominating Headline on Mobile & Desktop */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] sm:leading-[1.12]">
              Give every client a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                real-time, professional
              </span>{' '}
              view of their project.
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-lg text-zinc-400 max-w-xl leading-relaxed font-normal">
              Elevate your freelance workflow with secure client portals, automated progress tracking, GitHub sync, and instant deliverable sign-offs. Replace scattered spreadsheets and endless status emails.
            </p>

            {/* Sleek Balanced Action Buttons in ONE Row */}
            <div className="flex flex-row items-center gap-2.5 sm:gap-3 pt-1 w-full max-w-md">
              <button
                onClick={handlePrimaryClick}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 bg-white hover:bg-zinc-200 text-black font-semibold rounded-sm text-xs sm:text-sm transition-all duration-200 shadow-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap"
              >
                <HugeiconsIcon icon={SecurityCheckIcon} size={15} className="shrink-0" />
                <span>Admin Login</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={13} className="shrink-0 hidden sm:inline" />
              </button>

              <button
                onClick={onSeeAction}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 rounded-sm text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white backdrop-blur-xl transition-all duration-200 cursor-pointer hover:scale-[1.01] whitespace-nowrap"
              >
                <HugeiconsIcon icon={PlayIcon} size={14} className="text-zinc-300 shrink-0" />
                <span>See it in Action</span>
              </button>
            </div>

          </motion.div>

          {/* Right Column: Handcrafted Monochrome Product Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 w-full"
          >
            <ProductPreviewShowcase />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
