import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AvatarPreviewStage } from './AvatarPreviewStage';
import { AvatarAppearanceEditor } from './AvatarAppearanceEditor';
import { AvatarCode } from '../components/AvatarCode';
import { useUpdateGuardianAvatar } from '../data/avatar.queries';
import type {
  GuardianAvatarDTO,
  BunkerAvatarConfig,
  AvatarPreviewContext,
} from '../types/avatar.types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Folder01Icon,
  Link01Icon,
  RotateLeftIcon,
  Copy01Icon,
  Delete02Icon,
  Tick01Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';

interface AvatarInspectorProps {
  avatar: GuardianAvatarDTO | null;
  onOpenAssign: (avatar: GuardianAvatarDTO) => void;
  onOpenRegenerate: (avatar: GuardianAvatarDTO) => void;
  onDuplicate: (avatar: GuardianAvatarDTO) => void;
  onReset: (avatar: GuardianAvatarDTO) => void;
  onDelete: (avatar: GuardianAvatarDTO) => void;
  onClose?: () => void;
}

export const AvatarInspector: React.FC<AvatarInspectorProps> = ({
  avatar,
  onOpenAssign,
  onOpenRegenerate,
  onDuplicate,
  onReset,
  onDelete,
  onClose,
}) => {
  const navigate = useNavigate();
  const updateMutation = useUpdateGuardianAvatar();

  const [name, setName] = useState('');
  const [draftConfig, setDraftConfig] = useState<BunkerAvatarConfig | null>(null);
  const [previewContext, setPreviewContext] = useState<AvatarPreviewContext>('studio');
  const [activeTab, setActiveTab] = useState<'appearance' | 'assignment' | 'metadata'>('appearance');

  // Synchronize when selected avatar changes
  useEffect(() => {
    if (avatar) {
      setName(avatar.name);
      setDraftConfig(avatar.config);
    }
  }, [avatar?.id, avatar?.updatedAt]);

  if (!avatar || !draftConfig) {
    return (
      <div className="h-full min-h-[500px] rounded-sm bg-zinc-950/80 border border-zinc-800/80 flex flex-col items-center justify-center p-8 text-center font-mono text-xs select-none space-y-3">
        <div className="w-12 h-12 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
          <HugeiconsIcon icon={SparklesIcon} size={22} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-white">Select a Guardian Identity</h4>
          <p className="text-zinc-500 font-sans max-w-xs">
            Choose an avatar from the library to inspect its 3D mesh, customize geometries, or bind to a project.
          </p>
        </div>
      </div>
    );
  }

  const isDirty =
    name !== avatar.name || JSON.stringify(draftConfig) !== JSON.stringify(avatar.config);

  const handleDiscard = () => {
    setName(avatar.name);
    setDraftConfig(avatar.config);
  };

  const handleSave = async () => {
    if (!isDirty) return;
    try {
      await updateMutation.mutateAsync({
        id: avatar.id,
        updates: {
          name: name.trim() || avatar.name,
          config: draftConfig,
        },
      });
    } catch (err) {
      console.error('Failed to save avatar changes:', err);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-sm bg-zinc-950/95 border border-zinc-800 shadow-2xl font-mono text-xs overflow-hidden select-none">
      {/* 1. Header Toolbar */}
      <div className="p-4 border-b border-zinc-850 bg-zinc-900/40 flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0 flex-1 space-y-1">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent font-bold text-white text-sm outline-none border-b border-transparent hover:border-zinc-700 focus:border-cyan-400 pb-0.5"
            placeholder="Guardian Display Name"
          />
          <div className="flex items-center gap-2">
            <AvatarCode code={avatar.avatarCode} size="xs" />
            <span className="text-[10px] text-zinc-500">v{avatar.generatorVersion}</span>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} />
          </button>
        )}
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {/* Live 3D Preview Stage */}
        <AvatarPreviewStage
          avatar={avatar}
          config={draftConfig}
          previewContext={previewContext}
          onSelectContext={setPreviewContext}
        />

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-zinc-850 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`px-3.5 py-2 font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'appearance'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
          >
            3D Appearance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assignment')}
            className={`px-3.5 py-2 font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'assignment'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
          >
            Assignment ({avatar.isAssigned ? '1' : '0'})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('metadata')}
            className={`px-3.5 py-2 font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'metadata'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
          >
            Identity Profile
          </button>
        </div>

        {/* Tab 1: Appearance Customization */}
        {activeTab === 'appearance' && (
          <AvatarAppearanceEditor config={draftConfig} onChange={setDraftConfig} />
        )}

        {/* Tab 2: Project Assignment */}
        {activeTab === 'assignment' && (
          <div className="space-y-4">
            <div className="p-4 rounded-sm bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Target Project Binding
                </span>
                <span className={`px-2 py-0.5 rounded text-[9.5px] uppercase font-bold ${avatar.isAssigned ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                  {avatar.isAssigned ? 'Active Assignment' : 'Unbound'}
                </span>
              </div>

              {avatar.isAssigned ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Folder01Icon} size={16} className="text-cyan-400 shrink-0" />
                    <h5 className="font-bold text-white text-sm truncate">{avatar.projectName}</h5>
                  </div>
                  {avatar.clientName && (
                    <p className="text-xs text-zinc-400 font-sans">
                      Client: <span className="text-zinc-200 font-semibold">{avatar.clientName}</span>
                    </p>
                  )}
                  <p className="text-[10.5px] text-zinc-500 font-sans">
                    This Guardian is rendered on the project workspace header, public client portal, and dynamic share OG previews.
                  </p>

                  <div className="pt-2 flex items-center gap-2">
                    {avatar.projectSlug && (
                      <button
                        type="button"
                        onClick={() => navigate(`/app/projects/${avatar.projectSlug}`)}
                        className="px-3 py-1.5 rounded-sm bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>Open Project</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenAssign(avatar)}
                      className="px-3 py-1.5 rounded-sm bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-cyan-300 font-bold text-xs cursor-pointer"
                    >
                      Reassign Project
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    This Guardian identity is currently unassigned. You can bind it to any active client project in your database.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenAssign(avatar)}
                    className="w-full py-2.5 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow inline-flex items-center justify-center gap-1.5"
                  >
                    <HugeiconsIcon icon={Link01Icon} size={14} />
                    <span>Assign to Project</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Metadata Profile */}
        {activeTab === 'metadata' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-sm bg-zinc-900/60 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Guardian ID</span>
                <div className="text-cyan-300 font-bold text-xs">{avatar.avatarCode}</div>
              </div>
              <div className="p-3 rounded-sm bg-zinc-900/60 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Engine Generator</span>
                <div className="text-white font-bold text-xs">Guardian v{avatar.generatorVersion}</div>
              </div>
              <div className="p-3 rounded-sm bg-zinc-900/60 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Created Date</span>
                <div className="text-zinc-300 text-xs">{avatar.createdAt}</div>
              </div>
              <div className="p-3 rounded-sm bg-zinc-900/60 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Last Modified</span>
                <div className="text-zinc-300 text-xs">{avatar.updatedAt}</div>
              </div>
            </div>

            {/* Quick Actions List */}
            <div className="p-3.5 rounded-sm bg-zinc-900/50 border border-zinc-800 space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                Identity Actions
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onOpenRegenerate(avatar)}
                  className="p-2.5 rounded-sm bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 font-bold text-left cursor-pointer flex items-center gap-2"
                >
                  <HugeiconsIcon icon={RotateLeftIcon} size={14} className="text-amber-400 shrink-0" />
                  <span className="truncate">Regenerate</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicate(avatar)}
                  className="p-2.5 rounded-sm bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 font-bold text-left cursor-pointer flex items-center gap-2"
                >
                  <HugeiconsIcon icon={Copy01Icon} size={14} className="text-emerald-400 shrink-0" />
                  <span className="truncate">Duplicate</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(avatar)}
                  className="p-2.5 rounded-sm bg-zinc-900 border border-zinc-800 hover:bg-rose-950/40 hover:border-rose-800/80 text-rose-300 font-bold text-left cursor-pointer flex items-center gap-2 col-span-2"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} className="shrink-0" />
                  <span className="truncate">Delete Guardian Identity</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Sticky Action Footer */}
      <div className="p-4 border-t border-zinc-850 bg-zinc-900/60 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onReset(avatar)}
            className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
          >
            Reset Default
          </button>
          <span className="text-zinc-700">•</span>
          <button
            type="button"
            onClick={() => onDelete(avatar)}
            className="text-xs text-rose-400/80 hover:text-rose-300 cursor-pointer"
          >
            Delete
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              type="button"
              onClick={handleDiscard}
              className="px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold text-xs cursor-pointer"
            >
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || updateMutation.isPending}
            className={`px-4 py-2 rounded-sm font-bold text-xs transition-all shadow cursor-pointer inline-flex items-center gap-1.5 ${isDirty
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
              }`}
          >
            <HugeiconsIcon icon={Tick01Icon} size={14} />
            <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
