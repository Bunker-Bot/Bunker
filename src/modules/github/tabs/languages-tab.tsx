import React from 'react';
import { motion } from 'framer-motion';
import { useGithubLanguages } from '../../../lib/supabase/queries/github';
import { ProjectEmptyState } from '../../../components/project/ProjectEmptyState';
import { CodeIcon } from '@hugeicons/core-free-icons';
import { getTechnologyIcon } from '../../../lib/constants/technology-icons';

const LANG_COLORS: Record<string, string> = {
  TypeScript: 'bg-[#3178C6]', JavaScript: 'bg-[#F1E05A]', Python: 'bg-[#3572A5]',
  HTML: 'bg-[#E34C26]', CSS: 'bg-[#563D7C]', SCSS: 'bg-[#C6538C]',
  Go: 'bg-[#00ADD8]', Rust: 'bg-[#DEA584]', Ruby: 'bg-[#701516]',
  Java: 'bg-[#B07219]', Kotlin: 'bg-[#A97BFF]', Swift: 'bg-[#F05138]',
  Shell: 'bg-[#89E051]', Dockerfile: 'bg-[#384D54]', Vue: 'bg-[#41B883]',
  Svelte: 'bg-[#FF3E00]', Mako: 'bg-[#7E6B5A]', PHP: 'bg-[#4F5D95]',
  'C++': 'bg-[#F34B7D]', 'C#': 'bg-[#178600]', C: 'bg-[#555555]',
};

interface LanguagesTabProps {
  projectId: string;
  repoUrl: string;
}

export const LanguagesTab: React.FC<LanguagesTabProps> = ({ projectId, repoUrl }) => {
  const { data: languages = [], isLoading } = useGithubLanguages(projectId, repoUrl, true);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (languages.length === 0) {
    return <ProjectEmptyState title="No Language Data" description="Sync repository to fetch language composition." icon={CodeIcon} />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 font-mono text-xs select-none">
      <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <span className="font-bold text-white text-xs">Language Composition</span>
          <span className="text-[10px] text-zinc-500 font-sans">{languages.length} Languages Detected</span>
        </div>

        {/* Proportional Usage Bar */}
        <div className="space-y-2">
          <div className="w-full h-3 rounded-sm bg-zinc-950 overflow-hidden flex border border-zinc-800">
            {languages.map((lang: any) => (
              <div
                key={lang.name}
                className={`h-full ${LANG_COLORS[lang.name] || 'bg-zinc-600'}`}
                style={{ width: `${lang.percentage}%` }}
                title={`${lang.name}: ${lang.percentage}%`}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono pt-1">
            {languages.map((lang: any) => (
              <div key={lang.name} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${LANG_COLORS[lang.name] || 'bg-zinc-500'}`} />
                <span className="font-bold text-white">{lang.name}</span>
                <span className="text-cyan-400 font-bold">{lang.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Language Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 pt-2">
          {languages.map((lang: any) => {
            const iconUrl = getTechnologyIcon(lang.name);
            return (
              <div key={lang.name} className="p-3.5 rounded bg-zinc-950 border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {iconUrl ? (
                      <img src={iconUrl} alt={lang.name} className="w-4 h-4 object-contain" />
                    ) : (
                      <span className={`w-3 h-3 rounded ${LANG_COLORS[lang.name] || 'bg-zinc-700'}`} />
                    )}
                    <span className="font-bold text-white text-sm">{lang.name}</span>
                  </div>
                  <span className="font-extrabold text-cyan-400 text-sm">{lang.percentage}%</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-sans border-t border-zinc-850 pt-2">
                  <span>Bytes: <strong className="text-zinc-200 font-mono">{lang.bytes?.toLocaleString()}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
