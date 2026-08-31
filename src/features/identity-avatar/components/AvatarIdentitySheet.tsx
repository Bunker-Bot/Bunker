import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../../components/ui/sheet';
import { GuardianIdentityCard } from './GuardianIdentityCard';
import type { BunkerAvatarConfig } from '../types/avatar.types';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon } from '@hugeicons/core-free-icons';

interface AvatarIdentitySheetProps {
  isOpen: boolean;
  onClose: () => void;
  config: BunkerAvatarConfig;
  avatarCode: string;
  name: string;
  projectName?: string | null;
  clientName?: string | null;
  status?: string | null;
}

export const AvatarIdentitySheet: React.FC<AvatarIdentitySheetProps> = ({
  isOpen,
  onClose,
  config,
  avatarCode,
  name,
  projectName,
  clientName,
  status = 'Active',
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="bg-zinc-950 border-t border-zinc-800 text-zinc-100 font-mono p-5 rounded-t-2xl max-w-lg mx-auto select-none"
      >
        <SheetHeader className="pb-3 border-b border-zinc-850">
          <SheetTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <HugeiconsIcon icon={SparklesIcon} size={16} className="text-cyan-400" />
            <span>Project Guardian Identity</span>
          </SheetTitle>
          <SheetDescription className="text-xs text-zinc-400 font-mono">
            Cryptographic project identity and verification details.
          </SheetDescription>
        </SheetHeader>

        <div className="pt-4 pb-2">
          <GuardianIdentityCard
            variant="portal-popover"
            config={config}
            avatarCode={avatarCode}
            name={name}
            projectName={projectName}
            clientName={clientName}
            status={status}
            className="w-full"
          />
        </div>

        <div className="pt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-sm bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Identity Profile
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
