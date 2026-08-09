import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase/client';
import { useProjects } from '../../lib/supabase/queries/projects';
import { useSyncGithubRepository, useGithubLiveTelemetry } from '../../lib/supabase/queries/github';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { GithubLinkForm } from './github-link-form';
import { GithubWorkspaceHeader } from './components/github-workspace-header';
import { GithubKpiTelemetry } from './components/github-kpi-telemetry';
import { GithubRepoSidebar } from './components/github-repo-sidebar';
import { GithubRepoHero } from './components/github-repo-hero';
import { GithubRightSidebar } from './components/github-right-sidebar';
import { OverviewTab } from './tabs/overview-tab';
import { CommitsTab } from './tabs/commits-tab';
import { BranchesTab } from './tabs/branches-tab';
import { PullRequestsTab } from './tabs/pull-requests-tab';
import { IssuesTab } from './tabs/issues-tab';
import { ReleasesTab } from './tabs/releases-tab';
import { ActionsTab } from './tabs/actions-tab';
import { LanguagesTab } from './tabs/languages-tab';
import { ContributorsTab } from './tabs/contributors-tab';
import { SecurityTab } from './tabs/security-tab';
import { InsightsTab } from './tabs/insights-tab';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  GitCommitIcon,
  GitBranchIcon,
  GitPullRequestIcon,
  AlertCircleIcon,
  Tag01Icon,
  PlayIcon,
  CodeIcon,
  UserGroupIcon,
  CheckmarkBadge01Icon,
  BarChartIcon,
  Building01Icon
} from '@hugeicons/core-free-icons';

export interface GithubRepoRecord {
  id: string;
  project_id: string;
  repo_url: string;
  organization: string | null;
  branch: string;
  visibility: 'public' | 'private';
  latest_version: string | null;
  latest_release: string | null;
  open_issues: number;
  open_prs: number;
  last_synced_at: string | null;
  is_pinned?: boolean;
}

type ActiveTab = 'overview' | 'commits' | 'branches' | 'pull_requests' | 'issues' | 'releases' | 'actions' | 'languages' | 'contributors' | 'security' | 'insights';

export const GitHubWorkspacePage: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isLinkFormOpen, setIsLinkFormOpen] = useState(false);

  const syncMutation = useSyncGithubRepository();

  const { data: dbRepos = [], refetch } = useQuery<GithubRepoRecord[]>({
    queryKey: ['github', 'all-repositories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('github_repositories')
        .select('*')
        .order('last_synced_at', { ascending: false });
      if (error) {
        console.error('[GitHubWorkspacePage] Failed to fetch repositories:', error);
        return [];
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  useRealtimeSubscription({
    table: 'github_repositories',
    queryKeyToInvalidate: ['github', 'all-repositories'],
  });

  const { data: projectsData } = useProjects({ limit: 100 });
  const projectsList = projectsData?.projects || [];

  const selectedRepo = dbRepos.find((r) => r.project_id === selectedProjectId) || dbRepos[0];
  const activeProjectId = selectedProjectId || selectedRepo?.project_id || projectsList[0]?.id || '';
  const activeRepoUrl = selectedRepo?.repo_url || '';
  const selectedProject = projectsList.find((p) => p.id === activeProjectId);

  const { data: telemetry, refetch: refetchTelemetry } = useGithubLiveTelemetry(
    activeProjectId,
    activeRepoUrl
  );

  const handleSyncSingle = async (e: React.MouseEvent, projectId: string, repoUrl: string) => {
    e.stopPropagation();
    await syncMutation.mutateAsync({ projectId, repoUrl, force: true });
    refetch();
    refetchTelemetry();
  };

  const handleSyncAll = async () => {
    if (dbRepos.length === 0) return;
    for (const r of dbRepos) {
      await syncMutation.mutateAsync({ projectId: r.project_id, repoUrl: r.repo_url, force: true });
    }
    refetch();
  };

  const tabs: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Building01Icon },
    { id: 'commits', label: 'Commits', icon: GitCommitIcon },
    { id: 'branches', label: 'Branches', icon: GitBranchIcon },
    { id: 'pull_requests', label: 'PRs', icon: GitPullRequestIcon },
    { id: 'issues', label: 'Issues', icon: AlertCircleIcon },
    { id: 'releases', label: 'Releases', icon: Tag01Icon },
    { id: 'actions', label: 'Actions', icon: PlayIcon },
    { id: 'languages', label: 'Languages', icon: CodeIcon },
    { id: 'contributors', label: 'Contributors', icon: UserGroupIcon },
    { id: 'security', label: 'Security', icon: CheckmarkBadge01Icon },
    { id: 'insights', label: 'Insights', icon: BarChartIcon },
  ];

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-4 sm:space-y-6 text-zinc-100 font-mono select-none pb-12">
      <GithubWorkspaceHeader
        onConnectRepo={() => setIsLinkFormOpen(true)}
        onSyncAll={handleSyncAll}
        isSyncing={syncMutation.isPending}
      />

      <GithubKpiTelemetry repositories={dbRepos} telemetry={telemetry} />

      {/* Three-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <GithubRepoSidebar
            repositories={dbRepos}
            projects={projectsList}
            selectedProjectId={activeProjectId}
            onSelectProject={(id) => setSelectedProjectId(id)}
            onSyncRepo={handleSyncSingle}
            isSyncing={syncMutation.isPending}
          />
        </div>

        {/* Center Main Workspace */}
        <div className="lg:col-span-6 space-y-3 sm:space-y-4 order-1 lg:order-2">
          {selectedRepo ? (
            <>
              <GithubRepoHero
                repo={selectedRepo}
                project={selectedProject}
                telemetry={telemetry}
                onSync={() => handleSyncSingle({ stopPropagation: () => {} } as any, activeProjectId, selectedRepo.repo_url)}
                onRefresh={() => refetchTelemetry()}
                isSyncing={syncMutation.isPending}
              />

              {/* Workspace Navigation Tabs */}
              <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-sm bg-zinc-900/90 border border-zinc-800 shadow-sm overflow-x-auto custom-scrollbar">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-sm text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                      }`}
                    >
                      <HugeiconsIcon icon={tab.icon} size={13} className={isActive ? 'text-cyan-400' : 'text-zinc-500'} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'overview' && <OverviewTab key="overview" repo={selectedRepo} telemetry={telemetry} />}
                {activeTab === 'commits' && <CommitsTab key="commits" projectId={activeProjectId} repoUrl={activeRepoUrl} />}
                {activeTab === 'branches' && <BranchesTab key="branches" repo={selectedRepo} telemetry={telemetry} />}
                {activeTab === 'pull_requests' && <PullRequestsTab key="pull_requests" projectId={activeProjectId} repoUrl={activeRepoUrl} />}
                {activeTab === 'issues' && <IssuesTab key="issues" projectId={activeProjectId} repoUrl={activeRepoUrl} />}
                {activeTab === 'releases' && <ReleasesTab key="releases" repo={selectedRepo} telemetry={telemetry} />}
                {activeTab === 'actions' && <ActionsTab key="actions" projectId={activeProjectId} repoUrl={activeRepoUrl} />}
                {activeTab === 'languages' && <LanguagesTab key="languages" projectId={activeProjectId} repoUrl={activeRepoUrl} />}
                {activeTab === 'contributors' && <ContributorsTab key="contributors" projectId={activeProjectId} repoUrl={activeRepoUrl} />}
                {activeTab === 'security' && <SecurityTab key="security" projectId={activeProjectId} />}
                {activeTab === 'insights' && <InsightsTab key="insights" projectId={activeProjectId} telemetry={telemetry} />}
              </AnimatePresence>
            </>
          ) : (
            <div className="p-6 sm:p-8 rounded-sm bg-zinc-900 border border-zinc-800 text-center text-zinc-400 text-xs">
              Select a repository from the left panel to inspect repository health & telemetry.
            </div>
          )}
        </div>

        {/* Right Telemetry Sidebar */}
        <div className="lg:col-span-3 order-3">
          <GithubRightSidebar repo={selectedRepo} telemetry={telemetry} />
        </div>
      </div>

      <GithubLinkForm
        isOpen={isLinkFormOpen}
        onClose={() => setIsLinkFormOpen(false)}
        projectId={activeProjectId || projectsList[0]?.id || ''}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default GitHubWorkspacePage;
