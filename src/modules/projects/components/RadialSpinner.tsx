import React from 'react';

interface RadialSpinnerProps {
  size?: number;
  className?: string;
}

/**
 * Enterprise 8-Spoke Radial Pinwheel Spinner
 * Replaces default loaders with high-fidelity macOS/iOS style radial spinner.
 */
export const RadialSpinner: React.FC<RadialSpinnerProps> = ({
  size = 14,
  className = 'text-current',
}) => (
  <svg
    className={`animate-spin shrink-0 ${className}`}
    style={{ width: size, height: size }}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path d="M12 2V6" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M12 18V22" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
    <path d="M4.93 4.93L7.76 7.76" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
    <path d="M16.24 16.24L19.07 19.07" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
    <path d="M2 12H6" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
    <path d="M18 12H22" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
    <path d="M4.93 19.07L7.76 16.24" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    <path d="M16.24 7.76L19.07 4.93" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
  </svg>
);

export default RadialSpinner;
