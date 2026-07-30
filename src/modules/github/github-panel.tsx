import React, { useState } from 'react';
import { useGithubRepository, useGithubLiveTelemetry, useSyncGithubRepository } from '../../lib/supabase/queries/github';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { getTechnologyIcon } from '../../lib/constants/technology-icons';
import { RadialSpinner } from '../../components/ui/RadialSpinner';
import { Badge } from '../../components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  GitBranchIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  AlertCircleIcon,
  RefreshIcon,
  StarIcon,
  Copy01Icon,
  Tick02Icon,
  UserGroupIcon,
  CpuIcon,
  Link01Icon,
  GithubIcon,
  PlayIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon
} from '@hugeicons/core-free-icons';

export interface GitHubPanelProps {
  projectId: string;
  githubRepoUrl?: string;
  onConnectRepo?: () => void;
  className?: string;
}

type TabType = 'overview' | 'commits' | 'pull_requests' | 'workflows' | 'languages';

const LANGUAGE_COLORS: Record<string, string> = {
  Python: '#3572A5',
  TypeScript: '#3178C6',
  JavaScript: '#F1E05A',
  HTML: '#E34C26',
  CSS: '#563D7C',
  SCSS: '#C6538C',
  'C++': '#F34B7D',
  'C#': '#178600',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#DEA584',
  Ruby: '#701516',
  Java: '#B07219',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  PHP: '#4F5D95',
  Shell: '#89E051',
  Dockerfile: '#384D54',
  Vue: '#41B883',
  Svelte: '#FF3E00',
  Mako: '#7E6B5A',
  Jupyter: '#DA5B0B',
};

function getLanguageColor(lang: string): string {
  return LANGUAGE_COLORS[lang] || '#A1A1AA';
}

export const GitHubPanel: React.FC<GitHubPanelProps> = ({
  projectId,
  githubRepoUrl,
  onConnectRepo,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedSha, setCopiedSha] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const { data: dbRepo, isLoading: isLoadingDb } = useGithubRepository(projectId);

  const targetRepoUrl = githubRepoUrl || dbRepo?.repo_url || '';

  // Auto-fetch live telemetry (commits, PRs, workflows, languages) on mount
  const { data: telemetryData, isLoading: isLoadingTelemetry, refetch: refetchTelemetry } = useGithubLiveTelemetry(
    projectId,
    targetRepoUrl
  );

  const syncMutation = useSyncGithubRepository();

  // Realtime subscription for github_repositories
  useRealtimeSubscription({
    table: 'github_repositories',
    filter: `project_id=eq.${projectId}`,
    queryKeyToInvalidate: ['github', 'repository', projectId],
  });

  const handleSync = async () => {
    if (!targetRepoUrl) return;
    setSyncError(null);
    try {
      await syncMutation.mutateAsync({ projectId, repoUrl: targetRepoUrl, force: true });
      refetchTelemetry();
    } catch (err: any) {
      setSyncError(err.message || 'Failed to synchronize repository.');
    }
  };

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  if (isLoadingDb || (targetRepoUrl && isLoadingTelemetry && !telemetryData)) {
    return (
      <div className="space-y-4 font-mono select-none p-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <RadialSpinner size={16} />
          <span>Fetching live GitHub repository telemetry...</span>
        </div>
        <div className="h-20 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!targetRepoUrl && !telemetryData) {
    return (
      <div className="p-8 rounded-sm bg-zinc-900/90 border border-zinc-800 text-center space-y-4 font-mono select-none">
        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
          <HugeiconsIcon icon={GithubIcon} size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white">No GitHub Repository Connected</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Connect a GitHub repository to monitor commits, pull requests, CI/CD builds, and issues in realtime.
          </p>
        </div>
        {onConnectRepo && (
          <button
            onClick={onConnectRepo}
            className="px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer"
          >
            Connect Repository
          </button>
        )}
      </div>
    );
  }

  const rawRepoUrl = telemetryData?.repository?.repo_url || targetRepoUrl || dbRepo?.repo_url || '';
  const repoFullName = rawRepoUrl.replace('https://github.com/', '') || 'GitHub Repository';

  const repoInfo = {
    fullName: repoFullName,
    url: rawRepoUrl || `https://github.com/${repoFullName}`,
    defaultBranch: telemetryData?.repository?.branch || dbRepo?.branch || 'main',
    visibility: telemetryData?.repository?.visibility || dbRepo?.visibility || 'private',
    openIssues: telemetryData?.repository?.open_issues ?? dbRepo?.open_issues ?? 0,
    openPrs: telemetryData?.repository?.open_prs ?? dbRepo?.open_prs ?? 0,
    stars: telemetryData?.repository?.stars || 0,
    forks: telemetryData?.repository?.forks || 0,
  };

  const commits = telemetryData?.commits || [];
  const latestCommit = telemetryData?.latestCommit || (commits.length > 0 ? commits[0] : null);
  const languages = telemetryData?.languages || {};
  const pullRequests = telemetryData?.pullRequests || [];
  const workflows = telemetryData?.workflows || [];
  const issues = telemetryData?.issues || [];
  const contributors = telemetryData?.contributors || [];

  const totalBytes = Object.values(languages).reduce((a: any, b: any) => a + b, 0) as number;
  const hasBothLists = contributors.length > 0 && issues.length > 0;

  return (
    <div className={`space-y-5 font-mono select-none ${className}`}>
      {/* 1. Header Banner */}
      <div className="relative rounded-sm bg-zinc-900/90 border border-zinc-800 p-4 sm:p-5 space-y-3 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-sm bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shrink-0">
              <HugeiconsIcon icon={GithubIcon} size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <a
                  href={repoInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-base font-bold text-white hover:underline flex items-center gap-1.5"
                >
                  <span className="truncate max-w-[160px] sm:max-w-[320px]">{repoInfo.fullName}</span>
                  <HugeiconsIcon icon={Link01Icon} size={13} className="text-zinc-500 shrink-0" />
                </a>
                <Badge variant={repoInfo.visibility === 'public' ? 'secondary' : 'outline'} className="hidden sm:inline-flex">
                  {repoInfo.visibility}
                </Badge>
                <span className="px-2 py-0.5 rounded-sm bg-zinc-800 text-zinc-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <HugeiconsIcon icon={GitBranchIcon} size={11} />
                  <span>{repoInfo.defaultBranch}</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 hidden sm:block">
                {dbRepo?.last_synced_at ? `Last synced ${new Date(dbRepo.last_synced_at).toLocaleTimeString()}` : 'Not synced yet'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={syncMutation.isPending || isLoadingTelemetry}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer disabled:opacity-50 shadow-sm shrink-0"
            title="Sync Repository"
          >
            {syncMutation.isPending || isLoadingTelemetry ? (
              <RadialSpinner size={14} />
            ) : (
              <HugeiconsIcon icon={RefreshIcon} size={15} />
            )}
            <span className="hidden sm:inline">{syncMutation.isPending || isLoadingTelemetry ? 'Syncing...' : 'Sync Repository'}</span>
          </button>
        </div>

        {syncError && (
          <div className="p-2.5 rounded-sm bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <HugeiconsIcon icon={AlertCircleIcon} size={16} />
            <span>{syncError}</span>
          </div>
        )}
      </div>

      {/* 2. Navigation Tabs — Scrollable Horizontal Row */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-zinc-800 pb-2 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-2.5 py-1.5 sm:px-3 rounded-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Overview"
        >
          <HugeiconsIcon icon={GithubIcon} size={14} />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('commits')}
          className={`px-2.5 py-1.5 sm:px-3 rounded-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'commits'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Commits"
        >
          <HugeiconsIcon icon={GitCommitIcon} size={14} />
          <span>Commits ({commits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pull_requests')}
          className={`px-2.5 py-1.5 sm:px-3 rounded-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'pull_requests'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Pull Requests"
        >
          <HugeiconsIcon icon={GitPullRequestIcon} size={14} />
          <span>PRs ({pullRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('workflows')}
          className={`px-2.5 py-1.5 sm:px-3 rounded-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'workflows'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Workflow Actions"
        >
          <HugeiconsIcon icon={PlayIcon} size={14} />
          <span>Workflows ({workflows.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('languages')}
          className={`px-2.5 py-1.5 sm:px-3 rounded-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'languages'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Languages"
        >
          <HugeiconsIcon icon={CpuIcon} size={14} />
          <span>Languages</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs">
            <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900 border border-zinc-800 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Stars</span>
                <HugeiconsIcon icon={StarIcon} size={15} className="text-amber-400" />
              </div>
              <span className="text-base sm:text-lg font-bold text-white block">{repoInfo.stars}</span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900 border border-zinc-800 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Open Issues</span>
                <HugeiconsIcon icon={AlertCircleIcon} size={15} className="text-rose-400" />
              </div>
              <span className="text-base sm:text-lg font-bold text-white block">{repoInfo.openIssues}</span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900 border border-zinc-800 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Pull Requests</span>
                <HugeiconsIcon icon={GitPullRequestIcon} size={15} className="text-emerald-400" />
              </div>
              <span className="text-base sm:text-lg font-bold text-white block">{repoInfo.openPrs}</span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900 border border-zinc-800 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Forks</span>
                <HugeiconsIcon icon={GitBranchIcon} size={15} className="text-cyan-400" />
              </div>
              <span className="text-base sm:text-lg font-bold text-white block">{repoInfo.forks}</span>
            </div>
          </div>

          {latestCommit && (
            <div className="p-4 sm:p-5 rounded-sm bg-zinc-900 border border-zinc-800 space-y-3 shadow-sm text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 gap-2">
                <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <HugeiconsIcon icon={GitCommitIcon} size={14} className="text-zinc-400 shrink-0" />
                  <span>Latest Commit</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopySha(latestCommit.sha)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer text-[10px] font-bold shrink-0"
                >
                  {copiedSha === latestCommit.sha ? (
                    <HugeiconsIcon icon={Tick02Icon} size={12} className="text-emerald-400" />
                  ) : (
                    <HugeiconsIcon icon={Copy01Icon} size={12} />
                  )}
                  <span>{latestCommit.shortSha}</span>
                </button>
              </div>

              <div className="space-y-1">
                <a href={latestCommit.url} target="_blank" rel="noopener noreferrer" className="font-bold text-white text-xs hover:underline block leading-snug">
                  {latestCommit.message}
                </a>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 flex-wrap">
                  <span>By {latestCommit.author}</span>
                  <span>•</span>
                  <span>{new Date(latestCommit.date).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Language Composition Card in Overview */}
          {totalBytes > 0 && (
            <div className="p-4 sm:p-5 rounded-sm bg-zinc-900 border border-zinc-800 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <HugeiconsIcon icon={CpuIcon} size={14} className="text-zinc-400" />
                  <span>Language Composition</span>
                </span>
              </div>

              {/* Combined Progress Bar */}
              <div className="w-full h-3 rounded-md bg-zinc-950 overflow-hidden border border-zinc-800 flex">
                {Object.entries(languages).map(([lang, bytes]: [string, any]) => {
                  const percent = (bytes / totalBytes) * 100;
                  const color = getLanguageColor(lang);
                  return (
                    <div
                      key={lang}
                      style={{ width: `${percent}%`, backgroundColor: color }}
                      className="h-full first:rounded-l-md last:rounded-r-md"
                      title={`${lang}: ${Math.round(percent)}%`}
                    />
                  );
                })}
              </div>

              <div className="space-y-2.5 pt-1">
                {Object.entries(languages).map(([lang, bytes]: [string, any]) => {
                  const percent = Math.round((bytes / totalBytes) * 100);
                  const color = getLanguageColor(lang);
                  const iconUrl = getTechnologyIcon(lang);

                  return (
                    <div key={lang} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <img
                            src={iconUrl}
                            alt={lang}
                            className="w-4 h-4 object-contain shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-zinc-200 font-bold">{lang}</span>
                        </div>
                        <span className="text-zinc-400 font-mono">{percent}% ({bytes.toLocaleString()} bytes)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800/80">
                        <div
                          className="h-full transition-all duration-500 rounded-full"
                          style={{ width: `${percent}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contributors & Issues Responsive Full-Width Grid */}
          {(contributors.length > 0 || issues.length > 0) && (
            <div className={`grid gap-4 text-xs ${hasBothLists ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {contributors.length > 0 && (
                <div className="p-4 rounded-sm bg-zinc-900 border border-zinc-800 space-y-2.5 shadow-sm w-full">
                  <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-800/80 pb-2">
                    <HugeiconsIcon icon={UserGroupIcon} size={14} className="text-zinc-400" />
                    <span>Top Contributors</span>
                  </span>
                  <div className="space-y-2">
                    {contributors.slice(0, 6).map((c: any) => (
                      <div key={c.login} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img src={c.avatar} alt={c.login} className="w-5 h-5 rounded-full" />
                          <a href={c.url} target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:underline">
                            {c.login}
                          </a>
                        </div>
                        <span className="text-zinc-400 text-[10px]">{c.contributions} Commits</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {issues.length > 0 && (
                <div className="p-4 rounded-sm bg-zinc-900 border border-zinc-800 space-y-2.5 shadow-sm w-full">
                  <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-800/80 pb-2">
                    <HugeiconsIcon icon={AlertCircleIcon} size={14} className="text-zinc-400" />
                    <span>Recent Open Issues</span>
                  </span>
                  <div className="space-y-2">
                    {issues.slice(0, 6).map((iss: any) => (
                      <div key={iss.id} className="flex items-center justify-between text-xs">
                        <a href={iss.url} target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:underline truncate max-w-[200px]">
                          #{iss.number} {iss.title}
                        </a>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800 uppercase font-bold">
                          {iss.state}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* COMMITS TAB */}
      {activeTab === 'commits' && (
        <div className="p-4 sm:p-5 rounded-sm bg-zinc-900 border border-zinc-800 space-y-3 text-xs shadow-sm">
          <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-800/80 pb-2.5">
            <HugeiconsIcon icon={GitCommitIcon} size={14} className="text-zinc-400" />
            <span>Commit History ({commits.length})</span>
          </span>

          {commits.length > 0 ? (
            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {commits.map((c: any) => (
                <div key={c.sha} className="flex items-center justify-between p-3 rounded-sm bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                  <div className="space-y-1 min-w-0 pr-3">
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="font-bold text-white text-xs hover:underline truncate block">
                      {c.message}
                    </a>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 flex-wrap">
                      <span>{c.author}</span>
                      <span>•</span>
                      <span>{new Date(c.date).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopySha(c.sha)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer text-[10px] font-mono shrink-0"
                  >
                    {copiedSha === c.sha ? (
                      <HugeiconsIcon icon={Tick02Icon} size={11} className="text-emerald-400" />
                    ) : (
                      <HugeiconsIcon icon={Copy01Icon} size={11} />
                    )}
                    <span>{c.shortSha}</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-zinc-400 text-xs">No commits loaded for this repository.</div>
          )}
        </div>
      )}

      {/* PULL REQUESTS TAB */}
      {activeTab === 'pull_requests' && (
        <div className="p-4 sm:p-5 rounded-sm bg-zinc-900 border border-zinc-800 space-y-3 text-xs shadow-sm">
          <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-800/80 pb-2.5">
            <HugeiconsIcon icon={GitPullRequestIcon} size={14} className="text-zinc-400" />
            <span>Pull Requests</span>
          </span>

          {pullRequests.length > 0 ? (
            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {pullRequests.map((pr: any) => (
                <div key={pr.id} className="flex items-center justify-between p-3 rounded-sm bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                  <div className="space-y-1 min-w-0 pr-3">
                    <a href={pr.url} target="_blank" rel="noopener noreferrer" className="font-bold text-white text-xs hover:underline truncate block">
                      #{pr.number} {pr.title}
                    </a>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 flex-wrap">
                      <span>By {pr.user}</span>
                      <span>•</span>
                      <span>Branch: {pr.branch}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold border shrink-0 ${
                    pr.state === 'open' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {pr.state}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-zinc-400 text-xs">No open or recent pull requests found.</div>
          )}
        </div>
      )}

      {/* WORKFLOW ACTIONS TAB */}
      {activeTab === 'workflows' && (
        <div className="p-4 sm:p-5 rounded-sm bg-zinc-900 border border-zinc-800 space-y-3 text-xs shadow-sm">
          <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-800/80 pb-2.5">
            <HugeiconsIcon icon={PlayIcon} size={14} className="text-zinc-400" />
            <span>GitHub Actions CI/CD Workflows</span>
          </span>

          {workflows.length > 0 ? (
            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {workflows.map((wf: any) => {
                const isSuccess = wf.conclusion === 'success';
                const isFailed = wf.conclusion === 'failure';

                return (
                  <div key={wf.id} className="flex items-center justify-between p-3 rounded-sm bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-sm bg-zinc-900 border border-zinc-800 shrink-0">
                        {isSuccess ? (
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-400" />
                        ) : isFailed ? (
                          <HugeiconsIcon icon={Cancel01Icon} size={14} className="text-rose-400" />
                        ) : (
                          <RadialSpinner size={14} />
                        )}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <a href={wf.url} target="_blank" rel="noopener noreferrer" className="font-bold text-white text-xs hover:underline block truncate">
                          {wf.name}
                        </a>
                        <p className="text-[10px] text-zinc-400 truncate">
                          Branch: {wf.headBranch} {wf.commitMessage ? `• Commit: ${wf.commitMessage}` : ''}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold border shrink-0 ${
                      isSuccess
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : isFailed
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {wf.conclusion || wf.status}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-zinc-400 text-xs">No GitHub Actions workflow runs recorded.</div>
          )}
        </div>
      )}

      {/* LANGUAGES TAB */}
      {activeTab === 'languages' && (
        <div className="p-4 sm:p-5 rounded-sm bg-zinc-900 border border-zinc-800 space-y-4 text-xs shadow-sm">
          <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-800/80 pb-2.5">
            <HugeiconsIcon icon={CpuIcon} size={14} className="text-zinc-400" />
            <span>Language Composition</span>
          </span>

          {/* Combined Color Bar */}
          {totalBytes > 0 && (
            <div className="w-full h-3 rounded-md bg-zinc-950 overflow-hidden border border-zinc-800 flex">
              {Object.entries(languages).map(([lang, bytes]: [string, any]) => {
                const percent = (bytes / totalBytes) * 100;
                const color = getLanguageColor(lang);
                return (
                  <div
                    key={lang}
                    style={{ width: `${percent}%`, backgroundColor: color }}
                    className="h-full first:rounded-l-md last:rounded-r-md"
                    title={`${lang}: ${Math.round(percent)}%`}
                  />
                );
              })}
            </div>
          )}

          {totalBytes > 0 ? (
            <div className="space-y-3 pt-2">
              {Object.entries(languages).map(([lang, bytes]: [string, any]) => {
                const percent = Math.round((bytes / totalBytes) * 100);
                const color = getLanguageColor(lang);
                const iconUrl = getTechnologyIcon(lang);

                return (
                  <div key={lang} className="space-y-1.5 p-3 rounded-sm bg-zinc-950/60 border border-zinc-800/60">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={iconUrl}
                          alt={lang}
                          className="w-4 h-4 object-contain shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-white font-bold">{lang}</span>
                      </div>
                      <span className="text-zinc-400 font-mono text-[11px]">{percent}% ({bytes.toLocaleString()} bytes)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-zinc-400 text-xs">No language data available.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default GitHubPanel;
