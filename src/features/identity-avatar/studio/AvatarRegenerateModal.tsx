import React, { useState } from 'react';
import { AvatarPoster } from '../components/AvatarPoster';
import { AvatarCode } from '../components/AvatarCode';
import { AvatarService } from '../data/avatar.service';
import { useUpdateGuardianAvatar } from '../data/avatar.queries';
import type { GuardianAvatarDTO, BunkerAvatarConfig } from '../types/avatar.types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  RotateLeftIcon,
  Cancel01Icon,
  Tick01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';

interface AvatarRegenerateModalProps {
  avatar: GuardianAvatarDTO;
  isOpen: boolean;
  onClose: () => void;
  onApplyNewConfig: (newConfig: BunkerAvatarConfig) => void;
}

export const AvatarRegenerateModal: React.FC<AvatarRegenerateModalProps> = ({
  avatar,
  isOpen,
  onClose,
  onApplyNewConfig,
}) => {
  const updateMutation = useUpdateGuardianAvatar();
  const [candidateConfig, setCandidateConfig] = useState<BunkerAvatarConfig>(() =>
    AvatarService.generateRegenerationCandidate(avatar)
  );

  React.useEffect(() => {
    if (isOpen && avatar) {
      setCandidateConfig(AvatarService.generateRegenerationCandidate(avatar));
    }
  }, [avatar?.id, isOpen]);

  if (!isOpen) return null;

  const handleRollNewCandidate = () => {
    setCandidateConfig(AvatarService.generateRegenerationCandidate(avatar));
  };

  const handleAcceptCandidate = async () => {
    try {
      await updateMutation.mutateAsync({
        id: avatar.id,
        updates: { config: candidateConfig },
      });
      onApplyNewConfig(candidateConfig);
      onClose();
    } catch (err) {
      console.error('Failed to regenerate avatar config:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none font-mono text-xs">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-sm p-5 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <HugeiconsIcon icon={RotateLeftIcon} size={16} className="text-cyan-400" />
            <span>Regenerate Identity Appearance</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-white cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        {/* Identity Stability Reassurance */}
        <div className="flex items-center justify-between p-3 rounded-sm bg-zinc-900/80 border border-zinc-800">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-cyan-400">Stable Identity Code</span>
            <p className="text-[11px] text-zinc-300 font-sans">
              Avatar Code & Project bindings are permanently preserved. Only 3D geometry & tone vary.
            </p>
          </div>
          <AvatarCode code={avatar.avatarCode} size="sm" />
        </div>

        {/* Side-by-Side Candidate Comparison */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current Variant */}
          <div className="p-3.5 rounded-sm bg-zinc-900/50 border border-zinc-800 space-y-2.5 flex flex-col items-center text-center">
            <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
              Current Variant
            </span>
            <div className="w-32 h-32 rounded-sm bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center shadow-inner">
              <AvatarPoster config={avatar.config} size="100%" />
            </div>
            <div className="text-[11px] space-y-0.5 text-zinc-400">
              <p className="font-bold text-white capitalize">{avatar.config.archetype}</p>
              <p className="text-[10px] capitalize">{avatar.config.material} Tone</p>
            </div>
          </div>

          {/* New Candidate Variant */}
          <div className="p-3.5 rounded-sm bg-cyan-950/20 border border-cyan-500/40 space-y-2.5 flex flex-col items-center text-center relative overflow-hidden">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-cyan-300 tracking-wider">
              <HugeiconsIcon icon={SparklesIcon} size={12} />
              <span>New Candidate</span>
            </div>
            <div className="w-32 h-32 rounded-sm bg-zinc-950 border border-cyan-500/50 overflow-hidden flex items-center justify-center shadow-inner ring-1 ring-cyan-500/30">
              <AvatarPoster config={candidateConfig} size="100%" />
            </div>
            <div className="text-[11px] space-y-0.5 text-zinc-300">
              <p className="font-bold text-white capitalize">{candidateConfig.archetype}</p>
              <p className="text-[10px] text-cyan-300 capitalize">{candidateConfig.material} Tone</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-850">
          <button
            type="button"
            onClick={handleRollNewCandidate}
            className="px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-cyan-300 font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <HugeiconsIcon icon={RotateLeftIcon} size={14} />
            <span>Roll Another Variant</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-sm bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold text-xs cursor-pointer"
            >
              Keep Current
            </button>
            <button
              type="button"
              onClick={handleAcceptCandidate}
              disabled={updateMutation.isPending}
              className="px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow inline-flex items-center gap-1.5"
            >
              <HugeiconsIcon icon={Tick01Icon} size={14} />
              <span>{updateMutation.isPending ? 'Applying...' : 'Use New Variant'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
