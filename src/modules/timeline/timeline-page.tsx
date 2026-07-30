import React, { useState } from 'react';
import { TimelineTab } from './timeline-tab';
import { useProjects } from '../../lib/supabase/queries/projects';
import { Select } from '../../../packages/ui/src/components/select';
import { PageHeader } from '../../../packages/ui/src/components/page-header';
import { RadialSpinner } from '../../components/ui/RadialSpinner';
import { Badge } from '../../components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Clock01Icon,
  Folder01Icon,
  FilterIcon
} from '@hugeicons/core-free-icons';

export const TimelinePage: React.FC = () => {
  const { data: projectsResult, isLoading: isLoadingProjects } = useProjects({ limit: 100 });

  const projects = React.useMemo(() => {
    if (!projectsResult) return [];
    const raw = (projectsResult as any)?.projects || (Array.isArray(projectsResult) ? projectsResult : []);
    return Array.isArray(raw) ? raw : [];
  }, [projectsResult]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  React.useEffect(() => {
    if (projects.length > 0) {
      if (!selectedProjectId || !projects.some((p: any) => p.id === selectedProjectId)) {
        setSelectedProjectId(projects[0].id);
      }
    }
  }, [projects, selectedProjectId]);

  const projectOptions = React.useMemo(() => {
    return projects.map((p: any) => ({
      value: p.id,
      label: p.name || 'Untitled Project',
    }));
  }, [projects]);

  const activeProject = projects.find((p: any) => p.id === selectedProjectId);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 text-zinc-100 font-mono select-none pb-12">
      {/* Shared Platform PageHeader Component */}
      <PageHeader
        title="Timeline & Progress Log"
        description="Chronological project development journal, client progress logs, and release history."
        icon={Clock01Icon}
        badge="Global History"
        breadcrumbs={[
          { label: 'Workspace', href: '/app/dashboard' },
          { label: 'Timeline' }
        ]}
        actions={
          <div className="flex items-center gap-2 text-xs min-w-[200px]">
            <HugeiconsIcon icon={FilterIcon} size={14} className="text-zinc-500 shrink-0" />
            <span className="text-zinc-400 shrink-0">Project:</span>
            {isLoadingProjects ? (
              <RadialSpinner size={16} />
            ) : (
              <Select
                value={selectedProjectId}
                onChange={setSelectedProjectId}
                options={projectOptions}
                placeholder="Select project..."
                className="w-48"
              />
            )}
          </div>
        }
      />

      {/* Selected Project Overview Card */}
      {activeProject && (
        <div className="p-4 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <HugeiconsIcon icon={Folder01Icon} size={15} className="text-zinc-400 shrink-0" />
            <span className="text-zinc-400">Active Workspace:</span>
            <span className="font-bold text-white truncate">{activeProject.name}</span>
            <Badge variant="outline" className="hidden sm:inline-flex">{activeProject.status}</Badge>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">ID: {activeProject.id}</span>
        </div>
      )}

      {/* Timeline Tab Workspace */}
      {selectedProjectId ? (
        <TimelineTab projectId={selectedProjectId} isAdmin={true} />
      ) : (
        <div className="p-12 rounded-sm bg-zinc-900 border border-zinc-800 text-center space-y-2 text-xs">
          <p className="text-zinc-400">Please select a project from the dropdown above to view its timeline history.</p>
        </div>
      )}
    </div>
  );
};

export default TimelinePage;
