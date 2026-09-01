import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FolderCheckIcon,
  PlusSignIcon,
  Search01Icon,
  Delete02Icon,
} from '@hugeicons/core-free-icons';
import { useTeamProjects, useAssignProjectToTeam } from '../../../../lib/supabase/queries/teams';
import { useProjects } from '../../../../lib/supabase/queries/projects';
import { AvatarPoster } from '../../../../features/identity-avatar';
import { generateAvatarConfig } from '../../../../features/identity-avatar/lib/avatar-generator';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../../components/ui/select';
import type { Team } from '../../types/team.types';

interface TeamProjectsViewProps {
  team: Team;
}

export const TeamProjectsView: React.FC<TeamProjectsViewProps> = ({ team }) => {
  const navigate = useNavigate();
  const { data: teamProjects = [], isLoading } = useTeamProjects(team.id);
  const { data: allProjectsData } = useProjects();
  const assignProjectMutation = useAssignProjectToTeam();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const allProjects: any[] = Array.isArray(allProjectsData) ? allProjectsData : (allProjectsData?.projects || []);

  // Unassigned projects that can be added to the team
  const availableProjects = allProjects.filter(
    (p: any) => !p.team_id || p.team_id !== team.id
  );

  const handleAssignProject = async () => {
    if (!selectedProjectId) return;
    await assignProjectMutation.mutateAsync({
      projectId: selectedProjectId,
      teamId: team.id,
    });
    setIsAssignModalOpen(false);
    setSelectedProjectId('');
  };

  const handleRemoveFromTeam = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!window.confirm('Remove project from this team workspace? The project will remain intact.')) return;
    await assignProjectMutation.mutateAsync({
      projectId,
      teamId: null,
    });
  };

  const filteredProjects = teamProjects.filter((p: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.client?.name?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team projects..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-sm transition-colors"
          >
            <HugeiconsIcon icon={FolderCheckIcon} size={16} className="text-zinc-400" />
            Assign Existing
          </button>
          <button
            onClick={() => navigate('/app/projects')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-black text-xs font-semibold rounded-sm transition-all shadow-lg shadow-cyan-500/20"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            New Project
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-zinc-900/40 border border-zinc-800/60 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-zinc-800 rounded-sm bg-zinc-950/40">
          <div className="w-12 h-12 rounded-sm bg-zinc-900 flex items-center justify-center text-zinc-500 mb-4">
            <HugeiconsIcon icon={FolderCheckIcon} size={24} />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">No projects in this team yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-5">
            Assign an existing project or create a new one to begin collaborating under this team identity.
          </p>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 rounded-sm transition-colors"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            Assign Project to Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: any) => {
            const avatarConfig =
              project.avatarConfig ||
              generateAvatarConfig({
                entityId: project.slug,
                entityKind: 'project',
                name: project.name,
                preferredColor: project.color || '#06B6D4',
              });

            return (
              <motion.div
                key={project.id}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/app/projects/${project.slug}`)}
                className="group relative flex flex-col justify-between p-5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-sm cursor-pointer transition-all shadow-lg overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-sm bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center relative flex-shrink-0 shadow-md">
                        <AvatarPoster config={avatarConfig} size="100%" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-200 group-hover:text-cyan-400 transition-colors">
                          {project.name}
                        </h3>
                        <div className="text-[10px] text-zinc-500">
                          {project.client?.name ? `Client: ${project.client.name}` : 'Internal Project'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleRemoveFromTeam(e, project.id)}
                      title="Remove from Team"
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-sm transition-all"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={16} />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 min-h-[32px] mb-4">
                    {project.description || 'Project deliverable workspace.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                  {/* Financial Mini Badge - Correctly labeled PAID / BUDGET */}
                  {project.budget > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 text-[10px] uppercase font-medium tracking-wider">
                        Paid / Budget
                      </span>
                      <span className="font-bold text-xs">
                        <span className="text-emerald-400">{project.currency} {Number(project.received || 0).toLocaleString()}</span>
                        <span className="text-zinc-600 mx-1">/</span>
                        <span className="text-zinc-300">{Number(project.budget || 0).toLocaleString()}</span>
                      </span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>Progress</span>
                      <span>{project.completionPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-sm"
                        style={{ width: `${project.completionPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Assign Project Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Assign Project to {team.name}</h3>
            <p className="text-xs text-zinc-400">
              Select an unassigned project to link it with this collaborative workspace.
            </p>

            {availableProjects.length === 0 ? (
              <p className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-sm border border-amber-500/20">
                All existing projects are already assigned to a team.
              </p>
            ) : (
              <Select value={selectedProjectId} onValueChange={(val: any) => setSelectedProjectId(val)}>
                <SelectTrigger size="sm" className="w-full bg-zinc-950 border-zinc-800 rounded-sm text-xs text-zinc-100">
                  <SelectValue>
                    {availableProjects.find((p: any) => p.id === selectedProjectId)?.name || 'Select a project...'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 rounded-sm text-zinc-200">
                  {availableProjects.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignProject}
                disabled={!selectedProjectId || assignProjectMutation.isPending}
                className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold rounded-sm disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
