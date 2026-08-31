import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuardianEditorStore } from './state/useGuardianEditorStore';
import { AvatarCode } from '../components/AvatarCode';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  RotateLeftIcon,
  RotateRightIcon,
  Tick01Icon,
  Maximize01Icon,
  Minimize01Icon,
  Download01Icon,
  ViewIcon,
  MoreVerticalIcon,
  Copy01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

interface GuardianTopBarProps {
  onSave: () => void;
  isSaving: boolean;
  onSaveAsNew?: () => void;
}

export const GuardianTopBar: React.FC<GuardianTopBarProps> = ({
  onSave,
  isSaving,
  onSaveAsNew,
}) => {
  const navigate = useNavigate();
  const {
    name,
    setName,
    avatarCode,
    isDirty,
    undo,
    redo,
    canUndo,
    canRedo,
    compareMode,
    setCompareMode,
    isFullscreen,
    setIsFullscreen,
    mode,
    draftConfig,
    restoreDeterministicDefault,
    resetSection,
    selectedTool,
  } = useGuardianEditorStore();

  const handleExportPoster = () => {
    const json = JSON.stringify(draftConfig, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '-')}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="h-13 sm:h-14 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-850 px-2.5 sm:px-4 flex items-center justify-between gap-2 sm:gap-3 font-mono text-xs select-none shrink-0 z-30">
      {/* Left: Back Link & Guardian Name Inline Editor */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={() => {
            if (isDirty) {
              if (window.confirm('You have unsaved Guardian changes. Leave without saving?')) {
                navigate('/app/avatar-studio');
              }
            } else {
              navigate('/app/avatar-studio');
            }
          }}
          className="p-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors cursor-pointer shrink-0"
          title="Back to Avatar Studio"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={15} />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Guardian Name..."
            className="bg-transparent font-extrabold text-white text-xs sm:text-sm outline-none border-b border-transparent hover:border-zinc-700 focus:border-cyan-400 pb-0.5 max-w-[130px] xs:max-w-[180px] sm:max-w-xs truncate"
          />

          {avatarCode && avatarCode !== 'auto' ? (
            <span className="hidden xs:inline-block">
              <AvatarCode code={avatarCode} size="xs" />
            </span>
          ) : (
            <span className="px-1.5 sm:px-2 py-0.2 rounded text-[9.5px] sm:text-[10px] bg-zinc-900 border border-zinc-800 text-cyan-400 font-bold shrink-0">
              New ID
            </span>
          )}
        </div>
      </div>

      {/* Center: Command Status & History Controls (Desktop / Tablet) */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Unsaved State Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDirty ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            }`}
          />
          <span className={isDirty ? 'text-amber-300 font-bold' : 'text-zinc-400'}>
            {isDirty ? 'Unsaved changes' : 'Saved'}
          </span>
        </div>

        <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo()}
          className={`p-1.5 rounded border text-xs flex items-center gap-1 transition-all ${
            canUndo()
              ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200 cursor-pointer'
              : 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed opacity-50'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <HugeiconsIcon icon={RotateLeftIcon} size={14} />
        </button>

        <button
          type="button"
          onClick={redo}
          disabled={!canRedo()}
          className={`p-1.5 rounded border text-xs flex items-center gap-1 transition-all ${
            canRedo()
              ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200 cursor-pointer'
              : 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed opacity-50'
          }`}
          title="Redo (Ctrl+Shift+Z)"
        >
          <HugeiconsIcon icon={RotateRightIcon} size={14} />
        </button>

        {/* Before / After Toggle */}
        <button
          type="button"
          onClick={() => setCompareMode(!compareMode)}
          className={`px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            compareMode
              ? 'bg-cyan-950 border-cyan-700 text-cyan-300 shadow-sm'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
          }`}
          title="Compare with Saved"
        >
          <HugeiconsIcon icon={ViewIcon} size={13} />
          <span>Before / After</span>
        </button>
      </div>

      {/* Right: Actions & Save */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Fullscreen Preview Toggle */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer hidden md:block"
          title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Preview'}
        >
          <HugeiconsIcon icon={isFullscreen ? Minimize01Icon : Maximize01Icon} size={14} />
        </button>

        {/* Overflow Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-52 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 text-xs font-mono text-zinc-200 z-50"
            align="end"
          >
            <DropdownMenuItem onClick={() => resetSection(selectedTool)} className="cursor-pointer">
              <HugeiconsIcon icon={RotateLeftIcon} size={13} className="mr-2 text-amber-400" />
              <span>Reset Current Section</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={restoreDeterministicDefault} className="cursor-pointer">
              <HugeiconsIcon icon={SparklesIcon} size={13} className="mr-2 text-cyan-400" />
              <span>Restore Default Identity</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPoster} className="cursor-pointer">
              <HugeiconsIcon icon={Download01Icon} size={13} className="mr-2 text-sky-400" />
              <span>Export JSON Config</span>
            </DropdownMenuItem>
            {mode === 'edit' && onSaveAsNew && (
              <>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={onSaveAsNew} className="cursor-pointer">
                  <HugeiconsIcon icon={Copy01Icon} size={13} className="mr-2 text-emerald-400" />
                  <span>Save as New Identity</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Primary Save Action */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-3 sm:px-4 py-1.5 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5 shrink-0"
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : (
            <>
              <HugeiconsIcon icon={Tick01Icon} size={14} className="text-black" />
              <span className="hidden xs:inline">{mode === 'create' ? 'Create Guardian' : 'Save Guardian'}</span>
              <span className="xs:hidden">{mode === 'create' ? 'Create' : 'Save'}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default GuardianTopBar;
