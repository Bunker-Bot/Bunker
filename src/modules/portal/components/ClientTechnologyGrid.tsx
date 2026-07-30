import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { DocumentCodeIcon } from '@hugeicons/core-free-icons';
import { getTechnologyIcon } from '../../../lib/constants/technology-icons';

interface ClientTechnologyGridProps {
  techStack: string[];
}

const TECH_META: Record<string, { category: string; version: string; desc: string }> = {
  React: { category: 'Frontend UI', version: 'v19.0', desc: 'Modern reactive component UI framework' },
  TypeScript: { category: 'Language', version: 'v5.4', desc: 'Strict static typing & developer ergonomics' },
  'Node.js': { category: 'Backend Engine', version: 'v20.x', desc: 'High throughput asynchronous runtime' },
  Python: { category: 'Core & AI', version: 'v3.11', desc: 'Machine learning & automation services' },
  FastAPI: { category: 'API Layer', version: 'v0.110', desc: 'High performance ASGI web framework' },
  'Tailwind CSS': { category: 'Design System', version: 'v3.4', desc: 'Utility-first modern styling system' },
  mysql: { category: 'Database', version: 'v8.0', desc: 'Relational database management' },
  PostgreSQL: { category: 'Database', version: 'v16.0', desc: 'Enterprise relational data store' },
  Kotlin: { category: 'Mobile & Service', version: 'v1.9', desc: 'Concise cross-platform language' },
  Nextjs: { category: 'Fullstack Framework', version: 'v14.2', desc: 'Server-side rendering & API routes' },
  xml: { category: 'Configuration', version: 'Config', desc: 'Structured data serialization format' },
};

export const ClientTechnologyGrid: React.FC<ClientTechnologyGridProps> = ({ techStack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-5 sm:p-6 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl font-mono text-xs select-none space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-850 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-white text-base">
          <HugeiconsIcon icon={DocumentCodeIcon} size={18} className="text-cyan-400" />
          <span>Technology Architecture Stack</span>
        </div>
        <span className="text-[11px] text-zinc-400 font-sans">{techStack.length} Technologies Configured</span>
      </div>

      {techStack.length === 0 ? (
        <p className="text-zinc-500 text-xs py-4 text-center font-sans">No technologies specified for this project.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {techStack.map((tech) => {
            const iconUrl = getTechnologyIcon(tech);
            const meta = TECH_META[tech] || {
              category: 'Engine',
              version: 'Latest',
              desc: 'Production core technology dependency',
            };

            return (
              <motion.div
                key={tech}
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-sm bg-zinc-900/90 border border-zinc-850 hover:border-cyan-500/50 hover:bg-zinc-900 transition-all space-y-2 cursor-default group shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt=""
                        className="w-5 h-5 object-contain shrink-0 group-hover:scale-110 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-sm bg-zinc-800 border border-zinc-700 flex items-center justify-center text-cyan-400 shrink-0">
                        <HugeiconsIcon icon={DocumentCodeIcon} size={12} />
                      </div>
                    )}
                    <h4 className="font-extrabold text-white text-xs font-mono">{tech}</h4>
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded-sm border border-cyan-900/60 shrink-0">
                    {meta.version}
                  </span>
                </div>

                <div className="space-y-0.5 pt-1">
                  <span className="text-[9px] text-zinc-500 font-sans block uppercase tracking-wider font-bold">
                    {meta.category}
                  </span>
                  <p className="text-[10px] text-zinc-400 font-sans line-clamp-2 leading-tight">
                    {meta.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ClientTechnologyGrid;
