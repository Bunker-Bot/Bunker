import React from 'react';
import { motion } from 'framer-motion';

export interface AppLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
  showText?: boolean;
  titleText?: string;
  subtitleText?: string;
  ariaLabel?: string;
}

/**
 * Bunker Brand Logo Component
 * Abstract, minimal, flat geometric identity designed for modern software environments.
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  size = 32,
  className = '',
  animated = false,
  showText = false,
  titleText = 'Bunker Studio Pro',
  subtitleText = '',
  ariaLabel = 'Bunker Application Logo'
}) => {
  const svg = (
    <svg
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={`shrink-0 block text-white fill-current select-none ${className}`}
    >
      <path
        d="M 16 2 C 23.732 2, 30 8.268, 30 16 C 30 20.5, 27 24.5, 23.5 26.5 L 16 16 Z"
        fill="currentColor"
        fillOpacity="0.95"
      />
      <path
        d="M 30 16 C 30 23.732, 23.732 30, 16 30 C 11.5 30, 7.5 27, 5.5 23.5 L 16 16 Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      <path
        d="M 16 30 C 8.268 30, 2 23.732, 2 16 C 2 11.5, 5 7.5, 8.5 5.5 L 16 16 Z"
        fill="currentColor"
        fillOpacity="0.55"
      />
      <path
        d="M 2 16 C 2 8.268, 8.268 2, 16 2 C 20.5 2, 24.5 5, 26.5 8.5 L 16 16 Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
      <circle cx="16" cy="16" r="3.5" fill="#050505" />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );

  if (showText) {
    const content = (
      <div className="inline-flex items-center gap-2.5 overflow-hidden">
        {svg}
        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
          <span className="font-bold text-white tracking-tight text-sm font-sans select-none leading-none">
            {titleText}
          </span>
          {subtitleText && (
            <span className="text-[9px] font-mono text-zinc-400 font-semibold tracking-widest uppercase select-none mt-0.5">
              {subtitleText}
            </span>
          )}
        </div>
      </div>
    );

    if (animated) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex overflow-hidden"
        >
          {content}
        </motion.div>
      );
    }

    return content;
  }

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex"
      >
        {svg}
      </motion.div>
    );
  }

  return svg;
};

export default AppLogo;
