import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLogo } from '../../../components/ui/AppLogo';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  SecurityCheckIcon,
} from '@hugeicons/core-free-icons';
import { usePortalEntry } from './use-portal-entry';
import { PortalEntryGuardian } from './PortalEntryGuardian';
import { PortalEntryProgress } from './PortalEntryProgress';
import { PortalEntryIdentity } from './PortalEntryIdentity';
import { PortalEntryPasswordModal } from './PortalEntryPasswordModal';
import { PortalEntryErrorStates } from './PortalEntryErrorStates';

interface PortalEntryExperienceProps {
  token: string | undefined;
  onEnterPortal: (data: any) => void;
}

export const PortalEntryExperience: React.FC<PortalEntryExperienceProps> = ({
  token,
  onEnterPortal,
}) => {
  const { state, portalRawData, submitPassword, retry } = usePortalEntry(token);
  const [isHoveringCTA, setIsHoveringCTA] = useState(false);
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);

  const isTerminalError = [
    'invalid',
    'expired',
    'revoked',
    'access-restricted',
    'error',
  ].includes(state.stage);

  const handleEnterClick = () => {
    if (!state.isReady || isTransitioningOut) return;
    setIsTransitioningOut(true);
    setTimeout(() => {
      onEnterPortal(portalRawData);
    }, 450);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isTransitioningOut ? 0 : 1 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 bg-[#000000] text-[#FAFAFA] flex flex-col justify-between p-4 sm:p-8 select-none font-sans overflow-x-hidden overflow-y-auto"
    >
      {/* 1. Minimal Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between font-mono shrink-0 relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
            <AppLogo className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-xs font-bold tracking-widest text-white uppercase">
            BUNKER
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-zinc-900/80 border border-zinc-800 text-[10px] text-zinc-400 font-mono">
          <HugeiconsIcon icon={SecurityCheckIcon} size={12} className="text-cyan-400" />
          <span className="uppercase tracking-wider">Secure Vault</span>
        </div>
      </header>

      {/* 2. Centerpiece Body with Guardian & Progressive Stage Information */}
      <main className="w-full max-w-xl mx-auto my-auto flex flex-col items-center justify-center py-4 sm:py-6 space-y-4 sm:space-y-6 relative z-10">
        {/* Center Guardian Viewport */}
        <PortalEntryGuardian
          config={state.avatarConfig}
          mood={state.guardianMood}
          progress={state.progress}
          isReady={state.isReady}
          isHoveringCTA={isHoveringCTA}
        />

        {/* Dynamic Center Interaction Area */}
        <AnimatePresence mode="wait">
          {/* A. Terminal Error or Inactive Link */}
          {isTerminalError ? (
            <PortalEntryErrorStates
              key="error-state"
              stage={state.stage}
              errorMessage={state.errorMessage}
              onRetry={retry}
            />
          ) : state.isPasswordRequired ? (
            /* B. Password Authentication Modal */
            <PortalEntryPasswordModal
              key="password-modal"
              onSubmit={submitPassword}
              error={state.errorMessage}
            />
          ) : (
            /* C. Normal Progressive Loading & Ready State */
            <motion.div
              key="active-pipeline"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-4 sm:space-y-5"
            >
              {/* Identity Presentation */}
              <PortalEntryIdentity
                project={state.project}
                client={state.client}
                avatarCode={state.avatarCode}
                progress={state.progress}
              />

              {/* Progress Bar & Micro-Checklist (Visible during loading) */}
              {!state.isReady && (
                <PortalEntryProgress
                  progress={state.progress}
                  stageLabel={state.stageLabel}
                  isReady={state.isReady}
                  accentColor={state.avatarConfig.glowColor || state.project?.color || '#06B6D4'}
                />
              )}

              {/* Primary Ready CTA: [ Enter Portal ] */}
              {state.isReady && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="pt-2 flex flex-col items-center gap-2"
                >
                  <button
                    type="button"
                    autoFocus
                    onClick={handleEnterClick}
                    onMouseEnter={() => setIsHoveringCTA(true)}
                    onMouseLeave={() => setIsHoveringCTA(false)}
                    className="w-full sm:w-auto min-w-[200px] px-8 py-3.5 rounded-sm bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xl hover:shadow-cyan-500/20 group font-mono"
                  >
                    <span>Enter Portal</span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={15}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>

                  <span className="text-[10px] text-zinc-500 font-mono">
                    Press Enter or Space to open
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. Minimal Footer */}
      <footer className="w-full max-w-6xl mx-auto flex items-center justify-between text-[10px] text-zinc-600 font-mono shrink-0 pt-2 border-t border-zinc-900/60 relative z-20">
        <span>Zero-Trust Client Exchange</span>
        <span>Bunker Portal Engine</span>
      </footer>
    </motion.div>
  );
};

export default PortalEntryExperience;
