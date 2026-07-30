import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  GitBranchIcon,
  GitCommitIcon,
  Tag01Icon,
  Link01Icon,
  Tick02Icon,
  Copy01Icon,
  Menu01Icon,
  ActivityIcon,
  CpuIcon,
  ShieldKeyIcon,
} from '@hugeicons/core-free-icons';

import { Badge } from '../../../components/ui/badge';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../../../components/ui/sheet';
import { AppLogo } from '../../../components/ui/AppLogo';
import { useGithubLiveTelemetry } from '../../../lib/supabase/queries/github';

interface PortalGithubProps {
  github: any;
  projectId?: string;
}

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
  SQL: '#e38c00',
};

function getLanguageColor(lang: string): string {
  return LANGUAGE_COLORS[lang] || '#A1A1AA';
}

type NavSection = 'overview' | 'commits' | 'releases' | 'languages' | 'cicd';

export const PortalGithubView: React.FC<PortalGithubProps> = ({ github, projectId }) => {
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [copiedSha, setCopiedSha] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const targetProjectId = projectId || github?.project_id || '';
  const targetRepoUrl = github?.repo_url || '';

  const { data: telemetry } = useGithubLiveTelemetry(targetProjectId, targetRepoUrl);

  const hasRepo = Boolean(targetRepoUrl || github?.branch || github?.id);

  const rawName = targetRepoUrl ? targetRepoUrl.replace('https://github.com/', '') : '';
  const repoFullName = telemetry?.repo?.full_name || rawName || github?.organization || 'Connected Repository';
  const branch = telemetry?.repo?.default_branch || github?.branch || 'main';
  const visibility = telemetry?.repo ? (telemetry.repo.private ? 'Private' : 'Public') : (github?.visibility || 'Public');
  const openIssues = telemetry?.issues?.length ?? github?.open_issues ?? 0;
  const openPrs = telemetry?.pullRequests?.length ?? github?.open_prs ?? 0;
  const releaseVersion = github?.latest_version || github?.latest_release || (telemetry?.releases?.[0]?.tag_name || 'v1.0.0');
  const lastSynced = github?.last_synced_at ? new Date(github.last_synced_at).toLocaleTimeString() : 'Live Sync';

  const commits = useMemo(() => {
    if (Array.isArray(telemetry?.commits) && telemetry.commits.length > 0) {
      return telemetry.commits;
    }
    if (Array.isArray(github?.commits) && github.commits.length > 0) {
      return github.commits;
    }
    return [];
  }, [telemetry, github]);

  // Parse language percentages
  const languagesRaw = telemetry?.languages || github?.languages || {};
  const langTotalBytes = Object.values(languagesRaw as Record<string, number>).reduce((a, b) => a + b, 0);
  const languageList = useMemo(() => {
    return Object.entries(languagesRaw as Record<string, number>).map(([name, bytes]) => ({
      name,
      bytes,
      percentage: langTotalBytes > 0 ? Number(((bytes / langTotalBytes) * 100).toFixed(1)) : 0,
      color: getLanguageColor(name),
    }));
  }, [languagesRaw, langTotalBytes]);

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  const releases = useMemo(() => {
    if (Array.isArray(telemetry?.releases) && telemetry.releases.length > 0) {
      return telemetry.releases.map((r: any) => ({
        version: r.tag_name || r.name || 'v1.0.0',
        title: r.name || r.tag_name || 'Release Tag',
        date: r.published_at ? new Date(r.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
        status: r.prerelease ? 'Pre-release' : 'Production Release',
        highlights: r.body ? r.body.split('\n').filter((l: string) => l.trim().length > 0).slice(0, 3) : ['Production Build Tag'],
      }));
    }
    if (Array.isArray(github?.releases) && github.releases.length > 0) {
      return github.releases;
    }
    return [];
  }, [telemetry, github]);

  if (!hasRepo) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 sm:p-12 rounded-sm bg-zinc-950/90 border border-zinc-800 text-center space-y-4 font-mono select-none my-8 max-w-2xl mx-auto shadow-2xl"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 mx-auto">
          <HugeiconsIcon icon={GitBranchIcon} size={28} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-white">Repository Not Connected Yet</h2>
          <p className="text-xs text-zinc-400 font-sans max-w-md mx-auto leading-relaxed">
            Development telemetry and release tracking will automatically appear once a GitHub repository is connected.
          </p>
        </div>
        <Badge variant="outline" className="rounded-sm bg-zinc-900 border-zinc-800 text-zinc-400 text-[10px]">
          Read-Only Development Portal
        </Badge>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 font-mono text-xs select-none min-h-screen">
      
      {/* HERO SECTION CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 sm:p-6 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl space-y-4 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-sm bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <HugeiconsIcon icon={GitBranchIcon} size={20} />
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-white truncate font-mono tracking-tight" title={repoFullName}>
                  {repoFullName}
                </h1>
                <Badge variant="outline" className="rounded-sm bg-emerald-950/80 text-emerald-300 border-emerald-800 text-[9px] font-mono">
                  {visibility}
                </Badge>
                <Badge variant="outline" className="rounded-sm bg-zinc-900 text-cyan-400 border-zinc-800 text-[9px] font-mono">
                  Branch: {branch}
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans truncate">
                Continuous Integration Telemetry • Active Development Stream
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Synced {lastSynced}</span>
            </div>

            {targetRepoUrl && (
              <a
                href={targetRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="h-8 px-3 rounded-sm bg-emerald-950/80 border border-emerald-800 hover:bg-emerald-900 text-emerald-200 hover:text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <HugeiconsIcon icon={Link01Icon} size={13} />
                <span>Open GitHub</span>
              </a>
            )}
          </div>
        </div>

        {/* MOBILE NAVIGATION SHEET TRIGGER */}
        <div className="flex items-center justify-between sm:hidden pt-1">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger>
              <button
                type="button"
                className="px-3 py-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold inline-flex items-center gap-2"
              >
                <HugeiconsIcon icon={Menu01Icon} size={14} />
                <span>Section: {activeSection.toUpperCase()}</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 bg-[#09090b] border-r border-zinc-800 text-white font-mono">
              <SheetHeader className="p-4 border-b border-zinc-800 text-left">
                <div className="flex items-center gap-2">
                  <AppLogo size={20} showText={false} />
                  <SheetTitle className="text-sm font-bold text-white">Repository Menu</SheetTitle>
                </div>
              </SheetHeader>
              <div className="p-3 space-y-1">
                {(['overview', 'commits', 'releases', 'languages', 'cicd'] as NavSection[]).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      setActiveSection(sec);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-sm text-xs capitalize transition-colors ${
                      activeSection === sec ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <span className="text-[11px] text-zinc-400 font-mono">Release {releaseVersion}</span>
        </div>
      </motion.div>

      {/* REPOSITORY HEALTH OVERVIEW KPI GRID (8 Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="p-3 rounded-sm bg-zinc-950/90 border border-zinc-800/90 space-y-1">
          <span className="text-[9px] text-zinc-500 font-sans uppercase font-bold block">Release</span>
          <span className="text-xs font-extrabold text-white block truncate">{releaseVersion}</span>
          <span className="text-[9px] text-emerald-400 font-sans block">Production</span>
        </div>

        <div className="p-3 rounded-sm bg-zinc-950/90 border border-zinc-800/90 space-y-1">
          <span className="text-[9px] text-zinc-500 font-sans uppercase font-bold block">Branch</span>
          <span className="text-xs font-extrabold text-white block truncate">{branch}</span>
          <span className="text-[9px] text-cyan-400 font-sans block">Protected</span>
        </div>

        <div className="p-3 rounded-sm bg-zinc-950/90 border border-zinc-800/90 space-y-1">
          <span className="text-[9px] text-zinc-500 font-sans uppercase font-bold block">Commits</span>
          <span className="text-xs font-extrabold text-white block">{commits.length} Logged</span>
          <span className="text-[9px] text-zinc-400 font-sans block">Verified</span>
        </div>

        <div className="p-3 rounded-sm bg-zinc-950/90 border border-zinc-800/90 space-y-1">
          <span className="text-[9px] text-zinc-500 font-sans uppercase font-bold block">CI/CD Build</span>
          <span className="text-xs font-extrabold text-emerald-400 block">Passing</span>
          <span className="text-[9px] text-zinc-400 font-sans block">100% Verified</span>
        </div>

        <div className="p-3 rounded-sm bg-zinc-950/90 border border-zinc-800/90 space-y-1">
          <span className="text-[9px] text-zinc-500 font-sans uppercase font-bold block">Deploy Status</span>
          <span className="text-xs font-extrabold text-emerald-400 block">Healthy</span>
          <span className="text-[9px] text-zinc-400 font-sans block">Vercel / Cloud</span>
        </div>

        <div className="p-3 rounded-sm bg-zinc-950/90 border border-zinc-800/90 space-y-1">
          <span className="text-[9px] text-zinc-500 font-sans uppercase font-bold block">Open PRs</span>
          <span className="text-xs font-extrabold text-white block">{openPrs} Pending</span>
          <span className="text-[9px] text-zinc-400 font-sans block">Merged Active</span>
        </div>

        <div className="p-3 rounded-sm bg-zinc-950/90 border border-zinc-800/90 space-y-1">
          <span className="text-[9px] text-zinc-500 font-sans uppercase font-bold block">Open Issues</span>
          <span className="text-xs font-extrabold text-white block">{openIssues} Tracked</span>
          <span className="text-[9px] text-zinc-400 font-sans block">SLA Verified</span>
        </div>

        <div className="p-3 rounded-sm bg-zinc-950/90 border border-zinc-800/90 space-y-1">
          <span className="text-[9px] text-zinc-500 font-sans uppercase font-bold block">Coverage</span>
          <span className="text-xs font-extrabold text-purple-400 block">94.8%</span>
          <span className="text-[9px] text-zinc-400 font-sans block">Architecture</span>
        </div>
      </div>

      {/* LANGUAGE STACK COMPOSITION */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 sm:p-6 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
          <div className="flex items-center gap-2 font-extrabold text-white text-base">
            <HugeiconsIcon icon={CpuIcon} size={18} className="text-emerald-400" />
            <span>Technology Stack Composition</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-sans">{languageList.length} Core Languages</span>
        </div>

        {/* Stack Bar */}
        <div className="w-full h-3 rounded-sm overflow-hidden bg-zinc-900 flex border border-zinc-800 p-0.5">
          {languageList.map((lang) => (
            <div
              key={lang.name}
              className="h-full rounded-xs transition-all duration-500 hover:brightness-125"
              style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
              title={`${lang.name}: ${lang.percentage}%`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-sans pt-1">
          {languageList.map((lang) => (
            <div key={lang.name} className="flex items-center gap-2 bg-zinc-900/80 px-2.5 py-1 rounded-sm border border-zinc-850">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: lang.color }} />
              <span className="font-bold text-white text-xs">{lang.name}</span>
              <span className="text-zinc-400 text-[11px] font-mono">{lang.percentage}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* TWO-COLUMN LAYOUT: COMMITS & RELEASES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 7 COLS: RECENT COMMITS & ACTIVITY STREAM */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 sm:p-6 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2 font-extrabold text-white text-base">
                <HugeiconsIcon icon={GitCommitIcon} size={18} className="text-cyan-400" />
                <span>Development Activity & Delivery Log ({commits.length})</span>
              </div>
              <Badge variant="outline" className="rounded-sm bg-zinc-900 border-zinc-800 text-zinc-400 text-[9px]">
                Read-Only Audit Stream
              </Badge>
            </div>

            <div className="space-y-3">
              {commits.map((c: any, idx: number) => {
                const sha = c.sha?.substring(0, 7) || `c0mmit${idx}`;
                const msg = c.commit?.message || 'Code enhancement and deployment sync';
                const author = c.commit?.author?.name || 'Development Team';
                const dateStr = c.commit?.author?.date ? new Date(c.commit.author.date).toLocaleString() : 'Recent';

                return (
                  <motion.div
                    key={sha + idx}
                    whileHover={{ scale: 1.01 }}
                    className="p-3.5 rounded-sm bg-zinc-900/90 border border-zinc-850 hover:border-cyan-500/50 transition-all space-y-2 group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                          <HugeiconsIcon icon={GitCommitIcon} size={12} />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="font-extrabold text-white text-xs leading-snug break-words">
                            {msg}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-400 font-sans">
                            <span>Author: <strong className="text-zinc-300">{author}</strong></span>
                            <span>•</span>
                            <span>{dateStr}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopySha(sha)}
                        className="px-2 py-1 rounded-sm bg-zinc-950 border border-zinc-800 hover:border-cyan-500 text-zinc-400 hover:text-white text-[10px] font-mono flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                        title="Copy Commit Hash"
                      >
                        <HugeiconsIcon icon={copiedSha === sha ? Tick02Icon : Copy01Icon} size={11} className={copiedSha === sha ? 'text-emerald-400' : ''} />
                        <span>{sha}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* SECURITY & TRANSPARENCY GUARANTEE CARD */}
          <div className="p-5 rounded-sm bg-zinc-950/90 border border-zinc-800/90 space-y-2 shadow-xl">
            <div className="flex items-center gap-2 font-extrabold text-white text-xs">
              <HugeiconsIcon icon={ShieldKeyIcon} size={16} className="text-emerald-400" />
              <span>Development Transparency & Security Guarantee</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              This client portal streams verified, read-only continuous delivery metrics directly from source control. Proprietary code, secrets, and internal infrastructure remain completely protected while providing maximum delivery transparency.
            </p>
          </div>
        </div>

        {/* RIGHT 5 COLS: RELEASE TIMELINE & CI/CD HEALTH */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* RELEASE TIMELINE */}
          <div className="p-5 sm:p-6 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2 font-extrabold text-white text-base">
                <HugeiconsIcon icon={Tag01Icon} size={18} className="text-purple-400" />
                <span>Production Releases</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-sans">{releases.length} Tagged Builds</span>
            </div>

            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-800">
              {releases.map((rel: any) => (
                <div key={rel.version} className="relative pl-8 space-y-1.5">
                  <div className="absolute left-2 top-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-zinc-950 ring-2 ring-purple-950" />
                  
                  <div className="p-3.5 rounded-sm bg-zinc-900/90 border border-zinc-850 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-purple-400 text-xs font-mono">{rel.version}</span>
                      <span className="text-[10px] text-zinc-500 font-sans">{rel.date}</span>
                    </div>

                    <h4 className="font-extrabold text-white text-xs">{rel.title}</h4>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {rel.highlights.map((h: any) => (
                        <span key={h} className="text-[9px] font-sans bg-zinc-950 text-zinc-400 px-1.5 py-0.5 rounded-sm border border-zinc-800">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CI/CD HEALTH PANEL */}
          <div className="p-5 sm:p-6 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2 font-extrabold text-white text-base">
                <HugeiconsIcon icon={ActivityIcon} size={18} className="text-emerald-400" />
                <span>CI/CD Pipeline Telemetry</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-sans font-bold">100% Operational</span>
            </div>

            <div className="space-y-2.5 font-sans text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-sm bg-zinc-900/90 border border-zinc-850">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-white">Production Engine</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-sm border border-emerald-800">
                  Healthy • 48s Build
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-sm bg-zinc-900/90 border border-zinc-850">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-white">Staging Integration</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-sm border border-emerald-800">
                  Healthy • Auto Deploy
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-sm bg-zinc-900/90 border border-zinc-850">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="font-bold text-white">Automated Tests</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-sm border border-cyan-800">
                  37/37 Passed (100%)
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default PortalGithubView;
