import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Folder01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { type FormattedClient } from '../../../../lib/services/client.service';
import { useClientProjects } from '../../../../lib/supabase/queries/clients';
import { Badge } from '../../../../components/ui/badge';
import { ProjectSearchInput } from '../../../../components/project/ProjectSearchInput';
import { ProjectEmptyState } from '../../../../components/project/ProjectEmptyState';

interface ProjectsTabProps {
  client: FormattedClient;
  onCreateProject: () => void;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({ client, onCreateProject }) => {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useClientProjects(client.id, true);
  const [search, setSearch] = useState('');

  const projectList = projects || [];
  const filtered = projectList.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 font-mono text-xs select-none"
    >
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-sm bg-zinc-900/90 border border-zinc-800 shadow-sm">
        <div className="w-full sm:max-w-xs">
          <ProjectSearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search projects..."
          />
        </div>

        <button
          onClick={onCreateProject}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={15} />
          <span>New Project</span>
        </button>
      </div>

      {/* Enterprise Projects Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <ProjectEmptyState
          title="No Projects Found"
          description={search ? `No projects matching "${search}".` : 'No software projects assigned to this client yet.'}
          icon={Folder01Icon}
          action={
            <button onClick={onCreateProject} className="px-3.5 py-1.5 rounded-sm bg-white text-black font-bold text-xs">
              Assign Project
            </button>
          }
        />
      ) : (
        <div className="rounded-sm border border-zinc-800 bg-zinc-900/90 shadow-md overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-zinc-950/90 border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
              <tr>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Completion</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
              {filtered.map((proj: any) => {
                const target = proj.slug || proj.id;
                return (
                  <tr key={proj.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">
                      <span
                        className="hover:underline cursor-pointer"
                        onClick={() => navigate(`/app/projects/${target}`)}
                      >
                        {proj.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="rounded-sm bg-emerald-950/80 text-emerald-300 border-emerald-800 text-[10px] uppercase font-bold">
                        {proj.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] uppercase font-bold text-amber-400">{proj.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 max-w-[120px]">
                        <div className="w-full h-1.5 rounded-sm bg-zinc-950 overflow-hidden border border-zinc-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-sm"
                            style={{ width: `${proj.completionPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-cyan-400">{proj.completionPercent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 font-sans">{proj.deadline}</td>
                    <td className="px-4 py-3 text-zinc-400 text-[11px] font-mono">{proj.formattedUpdatedAt}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/app/projects/${target}`)}
                        className="text-zinc-400 hover:text-white font-bold cursor-pointer"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};
