import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../../lib/supabase/client';
import { useGuardianEditorStore } from '../state/useGuardianEditorStore';
import { AvatarCode } from '../../components/AvatarCode';
import { Select } from '../../../../../packages/ui/src/components/select';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  Folder01Icon,
  Copy01Icon,
  Tick01Icon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons';

export const IdentityControls: React.FC = () => {
  const {
    name,
    setName,
    avatarCode,
    projectId,
    setProjectId,
    publicBrief,
    setPublicBrief,
  } = useGuardianEditorStore();

  const [copied, setCopied] = useState(false);

  // Fetch all available projects for assignment dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['creator-projects-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          slug,
          color,
          clients (
            id,
            name,
            company
          )
        `)
        .order('name');
      if (error) return [];
      return (data as any) || [];
    },
  });

  const handleCopyCode = () => {
    if (!avatarCode || avatarCode === 'auto') return;
    navigator.clipboard.writeText(avatarCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const projectOptions = useMemo(() => {
    const opts = [
      { value: 'unassigned', label: '-- Unassigned (Stand-alone Identity) --' },
    ];
    for (const p of projects) {
      const clientLabel = (p as any).clients?.company || (p as any).clients?.name;
      opts.push({
        value: (p as any).id,
        label: clientLabel ? `${(p as any).name} (${clientLabel})` : (p as any).name,
      });
    }
    return opts;
  }, [projects]);

  const handleSelectProject = (pId: string) => {
    if (pId === 'unassigned') {
      setProjectId(null, undefined, undefined);
      return;
    }
    const match = projects.find((p: any) => p.id === pId);
    if (match) {
      const clientName = match.clients?.company || match.clients?.name || undefined;
      setProjectId(match.id, match.name, clientName);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none">
      {/* 1. Guardian Display Name */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <HugeiconsIcon icon={UserIcon} size={14} className="text-cyan-400" />
          <span>Guardian Display Name</span>
        </label>
        <input
          type="text"
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Commerce Guardian, Project Sentinel..."
          className="w-full px-3 py-2 rounded-sm bg-zinc-900/90 border border-zinc-800 focus:border-cyan-500 text-xs text-white placeholder:text-zinc-600 outline-none font-mono"
        />
        <span className="text-[10px] text-zinc-500 font-sans block">
          Used across Bunker project overviews, client portal headers, and OG previews.
        </span>
      </div>

      {/* 2. 10-Digit Cryptographic Avatar Code */}
      <div className="p-3.5 rounded-sm bg-zinc-900/60 border border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] uppercase font-bold text-zinc-400">
            Persistent Guardian ID
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            disabled={!avatarCode || avatarCode === 'auto'}
            className="flex items-center gap-1 text-[10.5px] text-cyan-400 hover:text-cyan-300 cursor-pointer disabled:opacity-40"
          >
            <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} size={12} />
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          {avatarCode && avatarCode !== 'auto' ? (
            <AvatarCode code={avatarCode} size="md" />
          ) : (
            <span className="font-mono text-xs font-bold text-cyan-400">
              #GENERATED-ON-SAVE
            </span>
          )}
          <span className="text-[10px] text-zinc-500 font-sans">
            Immutable 10-digit checksum
          </span>
        </div>
      </div>

      {/* 3. Project & Client Workspace Assignment */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <HugeiconsIcon icon={Folder01Icon} size={14} className="text-cyan-400" />
          <span>Project Workspace Binding</span>
        </label>

        <Select
          value={projectId || 'unassigned'}
          onChange={handleSelectProject}
          options={projectOptions}
          placeholder="Select project assignment..."
        />

        <span className="text-[10px] text-zinc-500 font-sans block">
          Binding to a project automatically publishes this Guardian to the project's Client Portal.
        </span>
      </div>

      {/* 4. Public Identity Brief Note */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <HugeiconsIcon icon={InformationCircleIcon} size={14} className="text-cyan-400" />
            <span>Public Identity Brief</span>
          </label>
          <span className="text-[10px] text-zinc-500">{publicBrief.length}/160</span>
        </div>
        <textarea
          rows={3}
          maxLength={160}
          value={publicBrief}
          onChange={(e) => setPublicBrief(e.target.value)}
          placeholder="Brief description displayed on hover popovers and share previews..."
          className="w-full px-3 py-2 rounded-sm bg-zinc-900/90 border border-zinc-800 focus:border-cyan-500 text-xs text-white placeholder:text-zinc-600 outline-none font-sans custom-scrollbar resize-none"
        />
        <span className="text-[10px] text-zinc-500 font-sans block">
          Only plain public-safe information is exposed on the client portal hover card.
        </span>
      </div>
    </div>
  );
};

export default IdentityControls;
