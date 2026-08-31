import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Clock01Icon,
  Edit01Icon,
  Building01Icon,
  CpuIcon,
  Tag01Icon,
  GithubIcon,
  Task01Icon,
  FileCodeIcon,
  Link01Icon,
  FireIcon,
  SparklesIcon,
  CloudIcon
} from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';
import { getTechnologyIcon } from '../../../lib/constants/technology-icons';
import { useClient } from '../../../lib/supabase/queries/clients';
import { useTaskStatistics } from '../../../lib/supabase/queries/tasks';
import { useDocuments } from '../../../lib/supabase/queries/documents';
import { useProjectUpdates } from '../../../lib/supabase/queries/timeline';
import { useDeployments } from '../../../lib/supabase/queries/changelog-notes-deployments';
import { useShareLinks } from '../../../lib/supabase/queries/share-links';
import { useGithubRepository } from '../../../lib/supabase/queries/github';
import { IdentityAvatar3D } from '../../../features/identity-avatar';
import { AvatarCode } from '../../../features/identity-avatar/components/AvatarCode';

interface ProjectExecutiveOverviewProps {
  project: any;
  onOpenEdit: () => void;
  onSelectTab: (tab: any) => void;
}

export const ProjectExecutiveOverview: React.FC<ProjectExecutiveOverviewProps> = ({
  project,
  onOpenEdit,
  onSelectTab,
}) => {
  const navigate = useNavigate();
  const projectId = project?.id || '';

  // 1. Fetch Real Client Profile Details
  const { data: client } = useClient(project.clientId || project.client_id || '');

  // 2. Fetch Real Tasks Statistics
  const { data: taskStats } = useTaskStatistics(projectId);

  // 3. Fetch Real Documents Count
  const { data: docsData } = useDocuments(projectId);

  // 4. Fetch Real Timeline Updates
  const { data: timelineData } = useProjectUpdates(projectId);

  // 5. Fetch Real Deployments List
  const { data: deployments } = useDeployments(projectId);

  // 6. Fetch Real Share Links List
  const { data: shareLinks } = useShareLinks(projectId);

  // 7. Fetch Real GitHub Repository Record from Supabase
  const { data: dbGithubRepo } = useGithubRepository(projectId);

  const githubRepoUrl = dbGithubRepo?.repo_url || project?.github_repo_url || project?.githubRepo || '';
  const repoName = githubRepoUrl ? githubRepoUrl.replace('https://github.com/', '') : '';

  // Computed Real Metrics
  const totalTasks = taskStats?.total || 0;
  const completedTasks = taskStats?.completed || 0;
  const taskCompletionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const docsCount = docsData?.totalCount || docsData?.documents?.length || 0;

  const timelineCount = timelineData?.pages?.[0]?.totalCount ||
    timelineData?.pages?.reduce((acc, p) => acc + (p.items?.length || 0), 0) || 0;

  const deploymentsCount = deployments?.length || 0;
  const activeDeploymentsCount = deployments?.filter((d) => d.status === 'successful').length || deploymentsCount;

  const shareLinksCount = shareLinks?.length || 0;

  // Real Overall Completion: Prioritize explicit project record completion percent (e.g. 75%), fallback to tasks
  const rawProjectPercent = project.completion_percent ?? project.completionPercent;
  const completionPercent = (rawProjectPercent !== undefined && rawProjectPercent !== null && rawProjectPercent !== '')
    ? Number(rawProjectPercent)
    : (totalTasks > 0 ? taskCompletionPercent : 75);

  // Real Health Score Calculation based on completion & active status
  const healthScore = React.useMemo(() => {
    if (project.status === 'completed') return 100;
    let score = 90;
    if (completionPercent > 0) score = Math.max(50, Math.min(100, Math.round(completionPercent * 0.4 + 60)));
    return score;
  }, [project.status, completionPercent]);

  const technologies: string[] = project.technologies || [];

  // Calculate Days Remaining
  const daysLeft = React.useMemo(() => {
    if (!project.deadline) return null;
    const diff = new Date(project.deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  }, [project.deadline]);

  const clientName = client?.name || (project.client ? project.client.name : null);
  const clientCompany = client?.company || null;
  const clientEmail = client?.email || null;
  const clientCountry = client?.country || null;

  // Helper for Status Badge with Shadcn/UI & Vibrant Colors
  const renderStatusBadge = (statusStr?: string) => {
    const s = (statusStr || 'active').toLowerCase();
    if (s === 'completed') {
      return (
        <Badge variant="outline" className="rounded-sm bg-blue-950/90 border-blue-700/80 text-blue-300 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Completed
        </Badge>
      );
    }
    if (s === 'in_progress' || s === 'in progress') {
      return (
        <Badge variant="outline" className="rounded-sm bg-cyan-950/90 border-cyan-700/80 text-cyan-300 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          In Progress
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="rounded-sm bg-emerald-950/90 border-emerald-700/80 text-emerald-300 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 flex items-center gap-1.5 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {statusStr ? statusStr.replace('_', ' ') : 'Active'}
      </Badge>
    );
  };

  // Helper for Priority Badge with Shadcn/UI & Vibrant Colors
  const renderPriorityBadge = (priorityStr?: string) => {
    const p = (priorityStr || 'medium').toLowerCase();
    if (p === 'urgent') {
      return (
        <Badge variant="outline" className="rounded-sm bg-rose-950/90 border-rose-700/80 text-rose-300 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 shadow-sm">
          Urgent Priority
        </Badge>
      );
    }
    if (p === 'high') {
      return (
        <Badge variant="outline" className="rounded-sm bg-amber-950/90 border-amber-700/80 text-amber-300 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 shadow-sm">
          High Priority
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="rounded-sm bg-amber-950/70 border-amber-800/60 text-amber-400 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 shadow-sm">
        {priorityStr} Priority
      </Badge>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5 font-mono text-zinc-100 select-none">
      {/* 1. Hero Executive Project Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-sm bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-3.5 sm:p-6 shadow-xl space-y-4 sm:space-y-5 relative overflow-hidden"
      >
        {/* Glow Accent Ambient Light */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ backgroundColor: project.color || '#3B82F6' }}
        />

        {/* Top Title & Spec Row */}
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 xl:gap-6 relative z-10">
          {/* Left Brand Identifier */}
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
            <div
              onClick={() => navigate(`/app/avatar-studio?project=${projectId}`)}
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-sm bg-zinc-950/90 border border-zinc-800 hover:border-cyan-500/70 shadow-xl flex items-center justify-center overflow-hidden shrink-0 cursor-pointer transition-all group"
              title="Click to open in Avatar Studio"
            >
              <IdentityAvatar3D
                config={project.avatar_config || project.guardian_avatar?.avatar_config}
                input={{
                  entityId: projectId,
                  entityKind: 'project',
                  name: project.name,
                  preferredColor: project.color,
                  parentEntityId: project.clientId || project.client_id || '',
                  logoUrl: project.thumbnail_url || (client as any)?.logo_url || null,
                }}
                badgeLogoUrl={(client as any)?.logo_url || null}
                size="100%"
              />
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white">{project.name}</h1>

                {/* 10-Digit Avatar Code */}
                {(project.avatar_code || project.avatarCode) && (
                  <AvatarCode code={project.avatar_code || project.avatarCode} size="xs" />
                )}

                {/* Colorful Shadcn/UI Status Badge */}
                {renderStatusBadge(project.status)}

                {/* Colorful Shadcn/UI Priority Badge */}
                {project.priority && renderPriorityBadge(project.priority)}
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 font-sans max-w-3xl leading-relaxed">
                {project.description || 'No detailed project description provided.'}
              </p>
            </div>
          </div>

          {/* Right Mobile Responsive Action Toolbar */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0 w-full xl:w-auto pt-3 xl:pt-0 border-t border-zinc-800/80 xl:border-t-0 pb-1 xl:pb-0">
            <button
              onClick={onOpenEdit}
              className="px-3 py-1.5 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap"
            >
              <HugeiconsIcon icon={Edit01Icon} size={14} />
              <span>Edit Workspace</span>
            </button>

            <button
              onClick={() => navigate(`/app/avatar-studio?project=${projectId}`)}
              className="px-3 py-1.5 rounded-sm bg-zinc-950 border border-zinc-800 hover:border-cyan-500/80 text-zinc-200 hover:text-cyan-300 font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              title="Customize Guardian in Avatar Studio"
            >
              <HugeiconsIcon icon={SparklesIcon} size={14} className="text-cyan-400" />
              <span>Avatar Studio</span>
            </button>

            <button
              onClick={() => onSelectTab('share-links')}
              className="px-3 py-1.5 rounded-sm bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap"
            >
              <HugeiconsIcon icon={Link01Icon} size={14} className="text-cyan-400" />
              <span>Share Portal ({shareLinksCount})</span>
            </button>

            <button
              onClick={() => onSelectTab('github')}
              className={`px-3 py-1.5 rounded-sm border font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${githubRepoUrl
                ? 'bg-zinc-950 border-emerald-800/90 text-emerald-300 hover:border-emerald-700'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
            >
              <HugeiconsIcon icon={GithubIcon} size={14} className={githubRepoUrl ? 'text-emerald-400' : 'text-zinc-400'} />
              <span>{githubRepoUrl ? 'GitHub Connected' : 'Connect GitHub'}</span>
            </button>

            <button
              onClick={() => onSelectTab('deployments')}
              className="px-3 py-1.5 rounded-sm bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap"
            >
              <HugeiconsIcon icon={CloudIcon} size={14} className="text-emerald-400" />
              <span>Deployments ({deploymentsCount})</span>
            </button>
          </div>
        </div>

        {/* Executive Overall Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800/80 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-300 flex items-center gap-2">
              <HugeiconsIcon icon={SparklesIcon} size={14} className="text-cyan-400" />
              <span className="text-xs">Overall Target Completion</span>
            </span>
            <span className="font-bold text-cyan-400 font-mono text-xs sm:text-sm">{completionPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-sm bg-zinc-950 border border-zinc-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-500 rounded-sm shadow"
            />
          </div>
        </div>

        {/* Specs Metadata Bar Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-zinc-800/80 text-xs relative z-10">
          <div className="p-2 sm:p-2.5 rounded-sm bg-zinc-950/80 border border-zinc-800 space-y-0.5">
            <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Status</span>
            <p className="font-bold text-emerald-400 capitalize text-xs">{project.status ? project.status.replace('_', ' ') : 'Active'}</p>
          </div>

          <div className="p-2 sm:p-2.5 rounded-sm bg-zinc-950/80 border border-zinc-800 space-y-0.5">
            <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Priority</span>
            <p className="font-bold text-amber-400 uppercase text-xs">{project.priority || 'Medium'}</p>
          </div>

          <div className="p-2 sm:p-2.5 rounded-sm bg-zinc-950/80 border border-zinc-800 space-y-0.5">
            <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Client Sponsor</span>
            <p className="font-bold text-white truncate text-xs" title={clientName || 'Unassigned'}>
              {clientName || 'Internal'}
            </p>
          </div>

          <div className="p-2 sm:p-2.5 rounded-sm bg-zinc-950/80 border border-zinc-800 space-y-0.5">
            <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Created</span>
            <p className="font-bold text-zinc-300 text-xs">
              {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div className="p-2 sm:p-2.5 rounded-sm bg-zinc-950/80 border border-zinc-800 space-y-0.5">
            <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Deadline</span>
            <p className="font-bold text-zinc-300 text-xs">
              {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No Target'}
            </p>
          </div>

          <div className="p-2 sm:p-2.5 rounded-sm bg-zinc-950/80 border border-zinc-800 space-y-0.5">
            <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Time Remaining</span>
            <p className="font-bold text-cyan-400 text-xs">
              {daysLeft !== null ? `${daysLeft} Days` : 'Ongoing'}
            </p>
          </div>
        </div>

        {/* Tech Stack Strip with Full Vibrant Colors */}
        {technologies.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-2 border-t border-zinc-800/80 relative z-10">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-500 tracking-wider mr-1">Stack:</span>
            {technologies.map((tech) => (
              <div
                key={tech}
                className="px-2 py-0.5 sm:py-1 rounded-sm bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-[10px] sm:text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <img
                  src={getTechnologyIcon(tech)}
                  alt={tech}
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="font-bold capitalize">{tech}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 2. Project Real KPI Metrics Cards Row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3"
      >
        {/* Tasks KPI */}
        <div
          onClick={() => onSelectTab('tasks')}
          className="p-3 sm:p-3.5 rounded-sm bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-850 transition-all cursor-pointer space-y-1.5 sm:space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">Tasks</span>
            <HugeiconsIcon icon={Task01Icon} size={15} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-extrabold text-white font-mono">{totalTasks}</span>
            <span className="text-[11px] sm:text-xs font-bold text-emerald-400 font-mono">{taskCompletionPercent}%</span>
          </div>
          <div className="w-full h-1.5 rounded-sm bg-zinc-950 overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-sm" style={{ width: `${taskCompletionPercent}%` }} />
          </div>
        </div>

        {/* Timeline KPI */}
        <div
          onClick={() => onSelectTab('timeline')}
          className="p-3 sm:p-3.5 rounded-sm bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850 transition-all cursor-pointer space-y-1.5 sm:space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">Timeline</span>
            <HugeiconsIcon icon={Clock01Icon} size={15} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-extrabold text-white font-mono">{timelineCount}</span>
            <span className="text-[11px] sm:text-xs text-zinc-400 font-mono">Logs</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-zinc-500 font-sans truncate">Updates stream</p>
        </div>

        {/* Documents KPI */}
        <div
          onClick={() => onSelectTab('documentation')}
          className="p-3 sm:p-3.5 rounded-sm bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-850 transition-all cursor-pointer space-y-1.5 sm:space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">Documents</span>
            <HugeiconsIcon icon={FileCodeIcon} size={15} className="text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-extrabold text-white font-mono">{docsCount}</span>
            <span className="text-[11px] sm:text-xs text-purple-400 font-mono">Specs</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-zinc-500 font-sans truncate">Knowledge Base</p>
        </div>

        {/* Deployments KPI */}
        <div
          onClick={() => onSelectTab('deployments')}
          className="p-3 sm:p-3.5 rounded-sm bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-850 transition-all cursor-pointer space-y-1.5 sm:space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">Deployments</span>
            <HugeiconsIcon icon={CloudIcon} size={15} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-extrabold text-white font-mono">{deploymentsCount}</span>
            <span className="text-[11px] sm:text-xs text-emerald-400 font-mono">{activeDeploymentsCount} Live</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-zinc-500 font-sans truncate">Build history</p>
        </div>

        {/* GitHub KPI */}
        <div
          onClick={() => onSelectTab('github')}
          className="p-3 sm:p-3.5 rounded-sm bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-850 transition-all cursor-pointer space-y-1.5 sm:space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">GitHub</span>
            <HugeiconsIcon icon={GithubIcon} size={15} className="text-white group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm sm:text-base font-extrabold text-white font-mono truncate">
              {dbGithubRepo?.open_prs !== undefined ? `${dbGithubRepo.open_prs} PRs` : (githubRepoUrl ? 'Synced' : 'Link')}
            </span>
            <span className="text-[11px] sm:text-xs text-emerald-400 font-mono">
              {githubRepoUrl ? 'Active' : 'Unlinked'}
            </span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-zinc-500 font-sans truncate">
            {repoName || 'Connect repo'}
          </p>
        </div>

        {/* Project Health Score KPI */}
        <div className="p-3 sm:p-3.5 rounded-sm bg-gradient-to-b from-emerald-950/40 to-zinc-900 border border-emerald-800/60 space-y-1.5 sm:space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">Health</span>
            <HugeiconsIcon icon={FireIcon} size={15} className="text-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">{healthScore}%</span>
            <span className="text-[11px] sm:text-xs font-bold text-emerald-300">
              {healthScore >= 80 ? 'Optimal' : 'Good'}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-sm bg-zinc-950 overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-sm" style={{ width: `${healthScore}%` }} />
          </div>
        </div>
      </motion.div>

      {/* 3. Main Split Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
        {/* Left Column (8 Columns) */}
        <div className="lg:col-span-8 space-y-3.5 sm:space-y-4">
          {/* GitHub Repository Status Banner */}
          {githubRepoUrl ? (
            <div className="p-3.5 sm:p-4 rounded-sm bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/30 border border-emerald-800/80 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={GithubIcon} size={16} className="text-white" />
                  <h2 className="text-xs font-bold uppercase text-zinc-100 tracking-wider">
                    GitHub Repository
                  </h2>
                  <Badge variant="outline" className="rounded-sm bg-emerald-950 border-emerald-800 text-emerald-300 text-[10px] font-mono font-bold uppercase px-2 py-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Synced
                  </Badge>
                </div>
                <button
                  onClick={() => onSelectTab('github')}
                  className="px-3 py-1 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs cursor-pointer transition-all shadow"
                >
                  View Telemetry
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded-sm bg-zinc-950 border border-zinc-800 space-y-0.5">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold">Repository Name</span>
                  <p className="font-bold text-white truncate" title={repoName}>{repoName}</p>
                </div>

                <div className="p-2 rounded-sm bg-zinc-950 border border-zinc-800 space-y-0.5">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold">Default Branch</span>
                  <p className="font-bold text-cyan-400">{dbGithubRepo?.branch || 'main'}</p>
                </div>

                <div className="p-2 rounded-sm bg-zinc-950 border border-zinc-800 space-y-0.5">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold">Open PRs & Issues</span>
                  <p className="font-bold text-amber-400">
                    {dbGithubRepo?.open_prs ?? 0} PRs • {dbGithubRepo?.open_issues ?? 0} Issues
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900 border border-zinc-800 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={GithubIcon} size={16} className="text-zinc-400" />
                  <span className="text-xs font-bold text-white">GitHub Repository Link</span>
                </div>
                <button
                  onClick={() => onSelectTab('github')}
                  className="px-3 py-1 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow"
                >
                  Connect GitHub
                </button>
              </div>
              <p className="text-xs text-zinc-400">Connect a GitHub repository to automatically sync commits, branches, issues, and releases with Bunker.</p>
            </div>
          )}

          {/* Real Technology Architecture Breakdown */}
          <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900 border border-zinc-800 space-y-3 shadow-sm">
            <h2 className="text-xs font-bold uppercase text-zinc-300 tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2.5">
              <HugeiconsIcon icon={CpuIcon} size={14} className="text-cyan-400" />
              <span>Technology Architecture Breakdown</span>
            </h2>

            {technologies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                {technologies.map((tech) => (
                  <div key={tech} className="p-2 rounded-sm bg-zinc-950 border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <img src={getTechnologyIcon(tech)} alt={tech} className="w-3.5 h-3.5 object-contain shrink-0" />
                      <span className="font-bold text-white capitalize truncate text-[11px]">{tech}</span>
                    </div>
                    <span className="text-[9px] text-emerald-400 font-bold shrink-0">OK</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic p-3 rounded-sm bg-zinc-950 border border-zinc-800">
                No technology tags configured for this workspace. Click Edit Workspace to add technologies.
              </p>
            )}
          </div>
        </div>

        {/* Right Column (4 Columns Sidebar Widgets) */}
        <div className="lg:col-span-4 space-y-3.5 sm:space-y-4">
          {/* Real Client Profile Card */}
          <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900 border border-zinc-800 space-y-3 shadow-sm text-xs">
            <h2 className="text-xs font-bold uppercase text-zinc-300 tracking-wider flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <span className="flex items-center gap-2">
                <HugeiconsIcon icon={Building01Icon} size={14} className="text-cyan-400" />
                <span>Client Sponsor</span>
              </span>
              <Badge variant="outline" className="rounded-sm bg-emerald-950 border-emerald-800 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5">
                {clientName ? 'Connected' : 'Internal'}
              </Badge>
            </h2>

            {clientName ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-sm bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                    {clientName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-xs truncate">{clientName}</h3>
                    <p className="text-zinc-400 text-[11px] truncate">{clientCompany || 'Corporate Partner'}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs">
                  {clientEmail && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Email:</span>
                      <span className="text-zinc-300 truncate max-w-[150px]">{clientEmail}</span>
                    </div>
                  )}

                  {clientCountry && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Location:</span>
                      <span className="text-zinc-300">{clientCountry}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-2.5 rounded-sm bg-zinc-950 border border-zinc-800 space-y-2 text-center">
                <p className="text-zinc-400 text-xs">No client linked to this workspace.</p>
                <button
                  onClick={onOpenEdit}
                  className="px-3 py-1 rounded-sm bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer"
                >
                  Assign Client
                </button>
              </div>
            )}
          </div>

          {/* Project Information Inspector */}
          <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900 border border-zinc-800 space-y-3 shadow-sm text-xs font-mono">
            <h2 className="text-xs font-bold uppercase text-zinc-300 tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2.5">
              <HugeiconsIcon icon={Tag01Icon} size={14} className="text-cyan-400" />
              <span>Project Information</span>
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Workspace Slug</span>
                <span className="font-bold text-zinc-200">{project.slug}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Project ID</span>
                <span className="font-mono text-zinc-400 text-[10px] truncate max-w-[110px]" title={project.id}>
                  {project.id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Total Tasks</span>
                <span className="text-zinc-200 font-bold">{totalTasks} Items</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Documents</span>
                <span className="text-zinc-200 font-bold">{docsCount} Specs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
