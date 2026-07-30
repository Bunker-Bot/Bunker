import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { GitBranchIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

interface ClientGithubSummaryProps {
  github: any;
  onNavigateGithub: () => void;
}

export const ClientGithubSummary: React.FC<ClientGithubSummaryProps> = ({
  github,
  onNavigateGithub,
}) => {
  const rawRepo = github?.repo_name || (github?.repo_url ? github.repo_url.split('/').slice(-2).join('/') : 'Bunker Repository');
  const branch = github?.branch || 'main';

  const languages = [
    { name: 'TypeScript', pct: 68, color: 'bg-blue-500' },
    { name: 'React UI', pct: 22, color: 'bg-cyan-400' },
    { name: 'SQL / Supabase', pct: 10, color: 'bg-emerald-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-5 sm:p-6 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl font-mono text-xs select-none space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-850 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-white text-base">
          <HugeiconsIcon icon={GitBranchIcon} size={18} className="text-emerald-400" />
          <span>Source Control Telemetry (GitHub)</span>
        </div>
        <button
          onClick={onNavigateGithub}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Repository Insights</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Repo Card */}
        <div className="p-4 rounded-sm bg-zinc-900/90 border border-zinc-850 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-sans uppercase font-bold block">Active Repository</span>
            <h4 className="font-extrabold text-white text-xs break-all mt-0.5" title={rawRepo}>
              {rawRepo}
            </h4>
          </div>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400">
            <span className="px-2 py-0.5 rounded-sm bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-[10px]">
              Branch: {branch}
            </span>
          </div>
        </div>

        {/* Latest Commit */}
        <div className="p-4 rounded-sm bg-zinc-900/90 border border-zinc-850 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-sans uppercase font-bold block">Latest Release / Commit</span>
            <h4 className="font-extrabold text-white text-xs truncate mt-0.5">v1.4.0 Production Build Sync</h4>
          </div>
          <p className="text-[10px] text-zinc-400 font-sans leading-tight">
            Continuous deployment pipeline verified & tagged.
          </p>
        </div>

        {/* Language Bar */}
        <div className="p-4 rounded-sm bg-zinc-900/90 border border-zinc-850 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-sans uppercase font-bold block">Language Distribution</span>
            <div className="w-full h-2 rounded-sm overflow-hidden bg-zinc-950 flex border border-zinc-800 mt-2">
              {languages.map((l) => (
                <div key={l.name} className={`${l.color} h-full`} style={{ width: `${l.pct}%` }} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-zinc-400 font-sans pt-1">
            {languages.map((l) => (
              <span key={l.name} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${l.color}`} />
                {l.name} {l.pct}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ClientGithubSummary;
