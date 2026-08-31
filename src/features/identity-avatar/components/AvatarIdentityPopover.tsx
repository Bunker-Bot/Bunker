import React, { useState, useRef, useEffect } from 'react';
import { GuardianIdentityCard } from './GuardianIdentityCard';
import type { BunkerAvatarConfig } from '../types/avatar.types';

interface AvatarIdentityPopoverProps {
  children: React.ReactNode;
  config: BunkerAvatarConfig;
  avatarCode: string;
  name: string;
  projectName?: string | null;
  clientName?: string | null;
  status?: string | null;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

export const AvatarIdentityPopover: React.FC<AvatarIdentityPopoverProps> = ({
  children,
  config,
  avatarCode,
  name,
  projectName,
  clientName,
  status = 'Active',
  className = '',
  side = 'bottom',
  align = 'center',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 150); // 150ms gentle hover delay to avoid accidental flicker
  };

  const handleMouseLeave = () => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180); // 180ms grace period to allow pointer to bridge from trigger to card
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={`${name} Identity Information (${avatarCode})`}
      className={`relative inline-block outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm cursor-pointer ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
      }}
    >
      {children}

      {/* Floating Identity Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`absolute z-50 animate-in fade-in-0 zoom-in-95 duration-150 shadow-2xl pointer-events-auto ${side === 'bottom'
              ? 'top-full mt-3'
              : side === 'top'
                ? 'bottom-full mb-3'
                : side === 'left'
                  ? 'right-full mr-3'
                  : 'left-full ml-3'
            } ${align === 'center'
              ? 'left-1/2 -translate-x-1/2'
              : align === 'end'
                ? 'right-0'
                : 'left-0'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          <GuardianIdentityCard
            variant="portal-popover"
            config={config}
            avatarCode={avatarCode}
            name={name}
            projectName={projectName}
            clientName={clientName}
            status={status}
          />
        </div>
      )}
    </div>
  );
};
