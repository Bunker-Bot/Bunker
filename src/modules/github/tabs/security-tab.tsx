import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkBadge01Icon } from '@hugeicons/core-free-icons';
import { Badge } from '../../../components/ui/badge';

interface SecurityTabProps {
  projectId: string;
}

export const SecurityTab: React.FC<SecurityTabProps> = () => {
  // Security scanning data is not fetched by the current github-sync edge function.
  // This tab shows the available security configuration status.
  const items = [
    { name: 'Dependency Alerts', description: 'Monitor via GitHub Security tab for vulnerability alerts.' },
    { name: 'Secret Scanning', description: 'Enable in repository settings to detect exposed secrets.' },
    { name: 'Code Scanning (CodeQL)', description: 'Configure via GitHub Actions workflow for automated code analysis.' },
    { name: 'Branch Protection', description: 'Configure required reviews and status checks on protected branches.' },
    { name: 'Dependabot', description: 'Enable automated security update pull requests in repository settings.' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-mono text-xs select-none">
      <div className="p-3.5 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-white text-xs">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={15} className="text-emerald-400" />
            <span>Security Configuration Guide</span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-500 font-sans">
          Security scanning details require GitHub Advanced Security API access. Configure the following features directly in your GitHub repository settings.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {items.map((item) => (
            <div key={item.name} className="p-3.5 sm:p-4 rounded bg-zinc-950 border border-zinc-850 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs sm:text-sm">{item.name}</span>
                <Badge variant="outline" className="rounded-sm bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px] uppercase font-bold shrink-0">
                  Configure
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
