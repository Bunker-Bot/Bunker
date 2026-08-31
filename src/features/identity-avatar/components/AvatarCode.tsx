import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import { copyAvatarCodeToClipboard, formatAvatarCode, cleanAvatarCode } from '../lib/avatar-code';

interface AvatarCodeProps {
  code: string | null | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showCopy?: boolean;
  className?: string;
  showHash?: boolean;
}

export const AvatarCode: React.FC<AvatarCodeProps> = ({
  code,
  size = 'sm',
  showCopy = true,
  className = '',
  showHash = true,
}) => {
  const [copied, setCopied] = useState(false);
  const clean = cleanAvatarCode(code);
  const formatted = showHash ? formatAvatarCode(code) : clean;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!clean) return;
    const success = await copyAvatarCodeToClipboard(clean);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded bg-zinc-900/90 border border-zinc-800/90 text-cyan-300 font-mono select-all font-semibold tabular-nums shadow-sm group/code ${sizeClasses[size]} ${className}`}
      title={`Guardian ID: ${clean}`}
    >
      <span className="tracking-wider">{formatted}</span>

      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy Guardian ID ${clean}`}
          className="p-0.5 text-zinc-500 hover:text-white transition-colors cursor-pointer rounded shrink-0 opacity-80 group-hover/code:opacity-100"
        >
          <HugeiconsIcon
            icon={copied ? Tick01Icon : Copy01Icon}
            size={size === 'xs' ? 10 : 12}
            className={copied ? 'text-emerald-400' : ''}
          />
        </button>
      )}
    </div>
  );
};
