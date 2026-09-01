import React from 'react';
import { AvatarPoster } from '../components/AvatarPoster';
import { AvatarCode } from '../components/AvatarCode';
import type { GuardianAvatarDTO } from '../types/avatar.types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Folder01Icon,
  MoreVerticalIcon,
  Link01Icon,
  RotateLeftIcon,
  Delete02Icon,
  Copy01Icon,
  Edit01Icon,
} from '@hugeicons/core-free-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../../components/ui/dropdown-menu';

interface AvatarLibraryCardProps {
  avatar: GuardianAvatarDTO;
  isSelected: boolean;
  onSelect: (avatar: GuardianAvatarDTO) => void;
  onOpenAssign: (avatar: GuardianAvatarDTO) => void;
  onOpenRegenerate: (avatar: GuardianAvatarDTO) => void;
  onDuplicate: (avatar: GuardianAvatarDTO) => void;
  onReset: (avatar: GuardianAvatarDTO) => void;
  onDelete: (avatar: GuardianAvatarDTO) => void;
}

export const AvatarLibraryCard: React.FC<AvatarLibraryCardProps> = ({
  avatar,
  isSelected,
  onSelect,
  onOpenAssign,
  onOpenRegenerate,
  onDuplicate,
  onReset,
  onDelete,
}) => {
  return (
    <div
      onClick={() => onSelect(avatar)}
      className={`group relative flex flex-col justify-between p-2.5 sm:p-4 rounded-sm border transition-all duration-200 cursor-pointer select-none font-mono text-xs overflow-hidden ${
        isSelected
          ? 'bg-zinc-900/95 border-cyan-500/80 ring-1 ring-cyan-500/60 shadow-xl shadow-cyan-950/20 -translate-y-0.5'
          : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60 shadow-md'
      }`}
    >
      {/* Subtle Glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none"
        style={{ backgroundColor: avatar.config.glowColor }}
      />

      <div className="space-y-2 sm:space-y-3 relative z-10">
        {/* Top Header: 10-digit Code + Overflow Menu */}
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          <AvatarCode code={avatar.avatarCode} size="xs" />

          <div className="flex items-center gap-1">
            {avatar.isAssigned ? (
              <span className="px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded text-[8px] sm:text-[9.5px] uppercase font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1 shadow-sm">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden xs:inline">Assigned</span>
              </span>
            ) : (
              <span className="px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded text-[8px] sm:text-[9.5px] uppercase font-bold bg-zinc-900 text-zinc-400 border border-zinc-800 hidden xs:inline">
                Available
              </span>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 text-xs font-mono text-zinc-200 z-50"
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem onClick={() => onSelect(avatar)} className="cursor-pointer">
                  <HugeiconsIcon icon={Edit01Icon} size={13} className="mr-2 text-cyan-400" />
                  <span>Customize in Studio</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onOpenAssign(avatar)} className="cursor-pointer">
                  <HugeiconsIcon icon={Link01Icon} size={13} className="mr-2 text-sky-400" />
                  <span>{avatar.isAssigned ? 'Reassign Project' : 'Assign to Project'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onOpenRegenerate(avatar)} className="cursor-pointer">
                  <HugeiconsIcon icon={RotateLeftIcon} size={13} className="mr-2 text-amber-400" />
                  <span>Regenerate Variant</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(avatar)} className="cursor-pointer">
                  <HugeiconsIcon icon={Copy01Icon} size={13} className="mr-2 text-emerald-400" />
                  <span>Duplicate Variant</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-850" />
                <DropdownMenuItem onClick={() => onReset(avatar)} className="cursor-pointer text-zinc-400 hover:text-white">
                  <span>Reset Default</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(avatar)} className="cursor-pointer text-rose-400 hover:text-rose-300">
                  <HugeiconsIcon icon={Delete02Icon} size={13} className="mr-2" />
                  <span>Delete Guardian</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 2D Vector Avatar Poster Showcase */}
        <div className="w-full aspect-square rounded-sm bg-zinc-900/90 border border-zinc-800/80 overflow-hidden flex items-center justify-center shadow-inner group-hover:border-zinc-700 transition-colors relative p-1">
          <AvatarPoster config={avatar.config} size="100%" />
        </div>

        {/* Title & Assignment Details */}
        <div className="space-y-0.5 sm:space-y-1">
          <h4 className="font-bold text-white text-[11px] sm:text-xs truncate group-hover:text-cyan-300 transition-colors">
            {avatar.name}
          </h4>

          {avatar.isAssigned ? (
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-zinc-300 font-sans truncate">
              <HugeiconsIcon icon={Folder01Icon} size={11} className="text-cyan-400 shrink-0" />
              <span className="truncate">{avatar.projectName}</span>
            </div>
          ) : (
            <p className="text-[9.5px] sm:text-[10px] text-zinc-500 font-sans truncate">Available</p>
          )}
        </div>
      </div>

      {/* Footer Tags */}
      <div className="pt-1.5 sm:pt-2 border-t border-zinc-850/80 flex items-center justify-between text-[8.5px] sm:text-[10px] text-zinc-400 mt-1.5 sm:mt-2 font-mono">
        <span className="capitalize truncate">{avatar.config.material}</span>
        <span className="capitalize text-zinc-500 truncate">{avatar.config.archetype}</span>
      </div>
    </div>
  );
};

export default AvatarLibraryCard;
