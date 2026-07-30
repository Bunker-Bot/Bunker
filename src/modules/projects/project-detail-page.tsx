import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProjectBySlug } from '../../lib/supabase/queries/projects';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { ProjectFormDrawer } from './project-form-drawer';
import { ProjectExecutiveOverview } from './components/project-executive-overview';
import { GitHubPanel } from '../github/github-panel';
import { TimelineTab } from '../timeline/timeline-tab';
import { DocumentationTab } from '../documentation/documentation-tab';
import { ShareLinksPanel } from '../share-links/share-links-panel';
import { KanbanBoard } from '../kanban/kanban-board';
import { DeploymentsTab } from '../deployments/deployments-tab';
import { MilestonesTab } from '../milestones/milestones-tab';

import { useTaskStatistics } from '../../lib/supabase/queries/tasks';
import { useDocuments } from '../../lib/supabase/queries/documents';
import { useProjectUpdates } from '../../lib/supabase/queries/timeline';
import { useDeployments } from '../../lib/supabase/queries/changelog-notes-deployments';
import { useShareLinks } from '../../lib/supabase/queries/share-links';
import { useGithubRepository } from '../../lib/supabase/queries/github';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  Folder01Icon,
  Clock01Icon,
  Edit01Icon,
  ArrowLeft01Icon,
  GithubIcon,
  DashboardSquare01Icon,
  Task01Icon,
  FileCodeIcon,
  CloudIcon,
  Link01Icon,
  Flag01Icon
} from '@hugeicons/core-free-icons';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'timeline' | 'github' | 'tasks' | 'deployments' | 'documentation' | 'share-links'>('overview');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: project, isLoading, isError, refetch } = useProjectBySlug(slug || '');
  const projectId = project?.id || '';

  // Real Query Hooks for Dynamic Navigation Badge Counts
  const { data: taskStats } = useTaskStatistics(projectId);
  const { data: docsData } = useDocuments(projectId);
  const { data: timelineData } = useProjectUpdates(projectId);
  const { data: deployments } = useDeployments(projectId);
  const { data: shareLinks } = useShareLinks(projectId);
  const { data: dbGithubRepo } = useGithubRepository(projectId);

  const realTaskCount = taskStats?.total || 0;
  const realDocsCount = docsData?.totalCount || docsData?.documents?.length || 0;
  const realTimelineCount = timelineData?.pages?.[0]?.totalCount || 
    timelineData?.pages?.reduce((acc, p) => acc + (p.items?.length || 0), 0) || 0;
  const realDeploymentsCount = deployments?.length || 0;
  const realShareLinksCount = shareLinks?.length || 0;
  const isGithubConnected = Boolean(dbGithubRepo?.repo_url || (project as any)?.github_repo_url || (project as any)?.githubRepo);

  // Realtime subscription for project updates
  useRealtimeSubscription({
    table: 'projects',
    filter: project?.id ? `id=eq.${project.id}` : undefined,
    queryKeyToInvalidate: ['projects', 'detail', slug || ''],
    enabled: Boolean(project?.id),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 font-mono select-none">
        <div className="h-44 rounded-md bg-zinc-900 border border-zinc-800 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-md bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 h-80 rounded-md bg-zinc-900 border border-zinc-800 animate-pulse" />
          <div className="lg:col-span-4 h-80 rounded-md bg-zinc-900 border border-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-6 font-mono select-none space-y-4">
        <button
          onClick={() => navigate('/app/projects')}
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          <span>Back to Projects Directory</span>
        </button>
        <div className="p-6 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs space-y-3">
          <h2 className="text-sm font-bold text-white">Project Not Found</h2>
          <p className="text-zinc-400">The requested project workspace could not be loaded from Supabase.</p>
          <button
            onClick={() => refetch()}
            className="px-3.5 py-2 rounded-md bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-3 sm:p-6 text-zinc-100 font-mono select-none pb-16 max-w-[1700px] mx-auto">
      {/* 1. Breadcrumb Header Nav */}
      <div className="flex items-center justify-between gap-3 text-xs text-zinc-400 border-b border-zinc-800/60 pb-3">
        <div className="flex items-center gap-2">
          <Link to="/app/projects" className="hover:text-white transition-colors flex items-center gap-1">
            <HugeiconsIcon icon={Folder01Icon} size={14} />
            <span>Projects</span>
          </Link>
          <span>/</span>
          <span className="text-white font-bold truncate max-w-[250px]">{project.name}</span>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-bold cursor-pointer transition-all"
        >
          <HugeiconsIcon icon={Edit01Icon} size={13} />
          <span>Edit Workspace</span>
        </button>
      </div>

      {/* 2. Interactive Navigation Tabs with Real Live Badges & rounded-md */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-zinc-800/80 pb-3 text-xs overflow-x-auto custom-scrollbar whitespace-nowrap">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-md font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-white text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <HugeiconsIcon icon={DashboardSquare01Icon} size={15} />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('milestones')}
          className={`px-3.5 py-2 rounded-md font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'milestones'
              ? 'bg-white text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <HugeiconsIcon icon={Flag01Icon} size={15} />
          <span>Milestones</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-3.5 py-2 rounded-md font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'timeline'
              ? 'bg-white text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <HugeiconsIcon icon={Clock01Icon} size={15} />
          <span>Timeline ({realTimelineCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`px-3.5 py-2 rounded-md font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'github'
              ? 'bg-white text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <HugeiconsIcon icon={GithubIcon} size={15} className={isGithubConnected ? 'text-zinc-200' : ''} />
          <span>GitHub {isGithubConnected ? '(Connected)' : ''}</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3.5 py-2 rounded-md font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'bg-white text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <HugeiconsIcon icon={Task01Icon} size={15} />
          <span>Tasks ({realTaskCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('deployments')}
          className={`px-3.5 py-2 rounded-md font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'deployments'
              ? 'bg-white text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <HugeiconsIcon icon={CloudIcon} size={15} />
          <span>Deployments ({realDeploymentsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('documentation')}
          className={`px-3.5 py-2 rounded-md font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'documentation'
              ? 'bg-white text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <HugeiconsIcon icon={FileCodeIcon} size={15} />
          <span>Documentation ({realDocsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('share-links')}
          className={`px-3.5 py-2 rounded-md font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'share-links'
              ? 'bg-white text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <HugeiconsIcon icon={Link01Icon} size={15} />
          <span>Share Links ({realShareLinksCount})</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'overview' && (
        <ProjectExecutiveOverview
          project={project}
          onOpenEdit={() => setIsDrawerOpen(true)}
          onSelectTab={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'milestones' && (
        <MilestonesTab projectId={project.id} readonly={false} />
      )}

      {activeTab === 'timeline' && (
        <TimelineTab projectId={project.id} isAdmin={true} />
      )}

      {activeTab === 'github' && (
        <GitHubPanel
          projectId={project.id}
          onConnectRepo={() => setIsDrawerOpen(true)}
        />
      )}

      {activeTab === 'tasks' && (
        <KanbanBoard />
      )}

      {activeTab === 'deployments' && (
        <DeploymentsTab />
      )}

      {activeTab === 'documentation' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <DocumentationTab projectId={project.id} />
        </motion.div>
      )}

      {activeTab === 'share-links' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <ShareLinksPanel projectId={project.id} />
        </motion.div>
      )}

      {/* Edit Project Drawer */}
      <ProjectFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        projectToEdit={project}
      />
    </div>
  );
};

export default ProjectDetailPage;
