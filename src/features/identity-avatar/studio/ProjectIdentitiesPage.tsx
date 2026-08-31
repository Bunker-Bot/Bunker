import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase/client';
import { useGuardianAvatars } from '../data/avatar.queries';
import { AvatarPoster } from '../components/AvatarPoster';
import { AvatarCode } from '../components/AvatarCode';
import { AvatarStudioShell } from './AvatarStudioShell';
import type { GuardianAvatarDTO } from '../types/avatar.types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Folder01Icon,
  Search01Icon,
  PlusSignIcon,
  ViewIcon,
  Settings02Icon,
} from '@hugeicons/core-free-icons';

interface ProjectMatrixItem {
  project: any;
  avatar: GuardianAvatarDTO | null;
  clientName: string;
}

export const ProjectIdentitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');

  // 1. Fetch all projects
  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ['matrix-projects-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          slug,
          color,
          status,
          avatar_config,
          created_at,
          clients (
            id,
            name,
            company
          )
        `)
        .order('name');
      if (error) throw error;
      return (data as any) || [];
    },
  });

  // 2. Fetch all avatar records
  const { data: avatars = [], isLoading: isAvatarsLoading } = useGuardianAvatars();

  // 3. Map Project -> Guardian DTO
  const projectMatrix: ProjectMatrixItem[] = useMemo(() => {
    return projects.map((p: any) => {
      const boundAvatar = avatars.find((a) => a.projectId === p.id);
      return {
        project: p,
        avatar: boundAvatar || null,
        clientName: p.clients?.company || p.clients?.name || 'Internal Workspace',
      };
    });
  }, [projects, avatars]);

  // 4. Filtered List
  const filteredMatrix = useMemo(() => {
    return projectMatrix.filter((item: ProjectMatrixItem) => {
      // Filter by assignment
      if (filter === 'assigned' && !item.avatar) return false;
      if (filter === 'unassigned' && item.avatar) return false;

      // Filter by search
      if (search.trim()) {
        const q = search.toLowerCase();
        const pName = item.project.name.toLowerCase();
        const cName = item.clientName.toLowerCase();
        const aName = item.avatar?.name.toLowerCase() || '';
        const aCode = item.avatar?.avatarCode || '';
        return pName.includes(q) || cName.includes(q) || aName.includes(q) || aCode.includes(q);
      }

      return true;
    });
  }, [projectMatrix, search, filter]);

  const assignedCount = projectMatrix.filter((m: ProjectMatrixItem) => m.avatar).length;
  const unassignedCount = projectMatrix.filter((m: ProjectMatrixItem) => !m.avatar).length;

  return (
    <AvatarStudioShell activeTab="projects">
      <div className="w-full space-y-6 font-mono text-xs select-none">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <HugeiconsIcon icon={Folder01Icon} size={20} className="text-cyan-400" />
              <span>Project Identity Matrix</span>
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              Cryptographic bindings between Bunker workspace deliverables and persistent Guardian avatars.
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-sm border border-zinc-800 self-stretch sm:self-auto">
            {[
              { id: 'all', label: `All (${projectMatrix.length})` },
              { id: 'assigned', label: `Assigned (${assignedCount})` },
              { id: 'unassigned', label: `Unassigned (${unassignedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer ${
                  filter === tab.id
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, clients, or Guardian identity codes (#XXXXXXXXXX)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-sm bg-zinc-900/90 border border-zinc-800 focus:border-cyan-500 text-xs text-white placeholder:text-zinc-500 font-mono outline-none"
          />
        </div>

        {/* Matrix Table */}
        <div className="rounded-sm border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 uppercase text-[10.5px]">
                  <th className="py-3 px-4 font-bold">Project Workspace</th>
                  <th className="py-3 px-4 font-bold">Client / Context</th>
                  <th className="py-3 px-4 font-bold">Guardian Identity</th>
                  <th className="py-3 px-4 font-bold">Persistent ID</th>
                  <th className="py-3 px-4 font-bold">Client Portal</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {isProjectsLoading || isAvatarsLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 font-sans">
                      Loading project identity matrix...
                    </td>
                  </tr>
                ) : filteredMatrix.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 font-sans">
                      No project identity bindings matched your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMatrix.map(({ project, avatar, clientName }: ProjectMatrixItem) => (
                    <tr
                      key={project.id}
                      className="hover:bg-zinc-900/40 transition-colors group"
                    >
                      {/* 1. Project Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: project.color || '#06B6D4' }}
                          />
                          <div>
                            <span className="font-extrabold text-white text-xs block">
                              {project.name}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-sans block">
                              /{project.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Client Info */}
                      <td className="py-3 px-4 font-sans text-zinc-300">
                        {clientName}
                      </td>

                      {/* 3. Guardian Thumbnail & Name */}
                      <td className="py-3 px-4">
                        {avatar ? (
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded bg-zinc-900 border border-zinc-800 p-0.5 overflow-hidden shrink-0">
                              <AvatarPoster config={avatar.config} size="100%" />
                            </div>
                            <div>
                              <span className="font-bold text-white text-xs block truncate max-w-[140px]">
                                {avatar.name}
                              </span>
                              <span className="text-[10px] text-zinc-500 capitalize">
                                {avatar.config.archetype} • {avatar.config.material}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-zinc-500 font-sans">
                            <span className="w-2 h-2 rounded-full bg-zinc-700" />
                            <span>No Guardian bound</span>
                          </div>
                        )}
                      </td>

                      {/* 4. 10-Digit ID */}
                      <td className="py-3 px-4">
                        {avatar ? (
                          <AvatarCode code={avatar.avatarCode} size="sm" />
                        ) : (
                          <span className="text-zinc-600 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* 5. Client Portal Status */}
                      <td className="py-3 px-4">
                        {avatar ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                            Active Sync
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-800">
                            Unconfigured
                          </span>
                        )}
                      </td>

                      {/* 6. Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {avatar ? (
                            <>
                              <button
                                type="button"
                                onClick={() => navigate(`/app/avatar-studio/${avatar.id}/edit`)}
                                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                                title="Open in Guardian Creator"
                              >
                                <HugeiconsIcon icon={Settings02Icon} size={12} />
                                <span>Customize</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => navigate(`/app/avatar-studio?avatar=${avatar.avatarCode}`)}
                                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                                title="View in Studio Library"
                              >
                                <HugeiconsIcon icon={ViewIcon} size={14} />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate(`/app/avatar-studio/create?project=${project.id}`)}
                              className="px-3 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <HugeiconsIcon icon={PlusSignIcon} size={12} />
                              <span>Create Guardian</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AvatarStudioShell>
  );
};

export default ProjectIdentitiesPage;
