import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AlertCircleIcon,
  Clock01Icon,
  Cancel01Icon,
  RotateLeftIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import type { PortalEntryStage } from './portal-entry.types';

interface PortalEntryErrorStatesProps {
  stage: PortalEntryStage;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export const PortalEntryErrorStates: React.FC<PortalEntryErrorStatesProps> = ({
  stage,
  errorMessage,
  onRetry,
}) => {
  const getCopy = () => {
    switch (stage) {
      case 'invalid':
        return {
          icon: Cancel01Icon,
          badge: 'Invalid Link',
          title: "This shared link isn't available",
          desc: 'The link you are trying to access is invalid or has been deleted.',
          allowRetry: false,
        };
      case 'expired':
        return {
          icon: Clock01Icon,
          badge: 'Link Expired',
          title: 'This shared link has expired',
          desc: 'The timeframe for accessing this shared project vault has ended.',
          allowRetry: false,
        };
      case 'revoked':
        return {
          icon: Cancel01Icon,
          badge: 'Access Revoked',
          title: 'This shared access is no longer available',
          desc: 'The project administrator has revoked access to this link.',
          allowRetry: false,
        };
      case 'access-restricted':
        return {
          icon: AlertCircleIcon,
          badge: 'Access Restricted',
          title: 'Action required before access',
          desc: 'This portal has reached its access limit or requires workspace confirmation.',
          allowRetry: true,
        };
      case 'error':
      default:
        return {
          icon: AlertCircleIcon,
          badge: 'Connection Error',
          title: "We couldn't prepare this portal",
          desc: errorMessage || 'A temporary connection error occurred while loading project data.',
          allowRetry: true,
        };
    }
  };

  const copy = getCopy();
  const IconComponent = copy.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-sm mx-auto text-center space-y-4 font-mono select-none"
    >
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-rose-950/80 border border-rose-800 text-rose-300 text-[10.5px] uppercase font-bold tracking-wider">
        <HugeiconsIcon icon={IconComponent} size={13} />
        <span>{copy.badge}</span>
      </div>

      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-bold text-white font-sans">
          {copy.title}
        </h2>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          {copy.desc}
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
        {copy.allowRetry && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto px-4 py-2 rounded-sm bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
          >
            <HugeiconsIcon icon={RotateLeftIcon} size={14} />
            <span>Try Again</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => (window.location.href = '/')}
          className="w-full sm:w-auto px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Return to Bunker</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default PortalEntryErrorStates;
