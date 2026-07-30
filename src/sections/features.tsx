import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Share01Icon,
  ActivityIcon,
  Task01Icon,
  CheckmarkCircle01Icon,
  GitBranchIcon,
  Folder01Icon,
  File01Icon,
  Clock01Icon,
  LockKeyIcon,
  SparklesIcon
} from '@hugeicons/core-free-icons';

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="scroll-mt-20 relative w-full py-24 border-t border-zinc-800/80 bg-[#050505] overflow-hidden">
      
      {/* Background Directional Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-zinc-800/15 via-zinc-700/5 to-transparent blur-[160px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-12 w-full space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl text-xs text-zinc-300 shadow-xl">
            <HugeiconsIcon icon={SparklesIcon} size={14} className="text-zinc-300 animate-pulse" />
            <span className="font-medium">Core Features</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
            Everything you need to deliver a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              professional client experience
            </span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Bunker combines project tracking, live GitHub sync, living documentation, and client collaboration into one premium operating system.
          </p>
        </div>

        {/* Feature Layout Grid with Rhythm & Hierarchy */}
        <div className="space-y-6">
          
          {/* ROW 1: Large Featured Hero Card (12-Column Span) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2 }}
            className="group relative p-8 sm:p-10 bg-[rgba(15,15,18,0.85)] border border-zinc-800/80 rounded-lg backdrop-blur-2xl shadow-2xl hover:border-zinc-700 transition-all duration-200 overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:-translate-y-0.5 transition-transform duration-200 shadow-lg">
                  <HugeiconsIcon icon={Share01Icon} size={28} />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">Flagship Portal Engine</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Professional Client Portal</h3>
                </div>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  Share a secure, branded workspace where clients can follow progress, review timelines, and access files without creating an account.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-mono text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>Zero-Trust PostgreSQL RLS Enforced</span>
                </div>
              </div>

              {/* Glass Preview Widget Inside Hero Card */}
              <div className="lg:col-span-6">
                <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-lg space-y-3 shadow-xl backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs font-mono text-zinc-300">
                    <span>Aetheria Cloud Portal</span>
                    <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-white">78% Completed</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-lg overflow-hidden">
                    <div className="w-[78%] h-full bg-white rounded-lg" />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                    <span>3 Milestones Active</span>
                    <span className="text-zinc-200">Live Client Link Active</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ROW 2: 3 Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 2: Live Project Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="group p-6 sm:p-7 bg-[rgba(15,15,18,0.85)] border border-zinc-800/80 rounded-lg backdrop-blur-2xl shadow-xl hover:border-zinc-700 hover:scale-[1.01] transition-all duration-200 space-y-4"
            >
              <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:-translate-y-1 transition-transform duration-200">
                <HugeiconsIcon icon={ActivityIcon} size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">Live Project Timeline</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Keep clients informed with structured progress updates, milestones, and completed work in real time.
              </p>
            </motion.div>

            {/* Card 3: Kanban Workspace */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="group p-6 sm:p-7 bg-[rgba(15,15,18,0.85)] border border-zinc-800/80 rounded-lg backdrop-blur-2xl shadow-xl hover:border-zinc-700 hover:scale-[1.01] transition-all duration-200 space-y-4"
            >
              <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:-translate-y-1 transition-transform duration-200">
                <HugeiconsIcon icon={Task01Icon} size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">Kanban Workspace</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Organize development with flexible boards, priorities, and workflows that stay in sync with project progress.
              </p>
            </motion.div>

            {/* Card 4: Milestone Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: 0.15 }}
              className="group p-6 sm:p-7 bg-[rgba(15,15,18,0.85)] border border-zinc-800/80 rounded-lg backdrop-blur-2xl shadow-xl hover:border-zinc-700 hover:scale-[1.01] transition-all duration-200 space-y-4"
            >
              <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:-translate-y-1 transition-transform duration-200">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">Milestone Tracking</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Break projects into clear delivery stages so clients always know what comes next.
              </p>
            </motion.div>

          </div>

          {/* ROW 3: 2 Wide Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 5: GitHub Connected */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="group p-7 sm:p-8 bg-[rgba(15,15,18,0.85)] border border-zinc-800/80 rounded-lg backdrop-blur-2xl shadow-xl hover:border-zinc-700 hover:scale-[1.01] transition-all duration-200 space-y-4"
            >
              <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:-translate-y-1 transition-transform duration-200">
                <HugeiconsIcon icon={GitBranchIcon} size={28} />
              </div>
              <h3 className="text-xl font-bold text-white">GitHub Connected</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Link repositories to automatically surface commits, releases, and development activity.
              </p>
            </motion.div>

            {/* Card 6: Project Files */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="group p-7 sm:p-8 bg-[rgba(15,15,18,0.85)] border border-zinc-800/80 rounded-lg backdrop-blur-2xl shadow-xl hover:border-zinc-700 hover:scale-[1.01] transition-all duration-200 space-y-4"
            >
              <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:-translate-y-1 transition-transform duration-200">
                <HugeiconsIcon icon={Folder01Icon} size={28} />
              </div>
              <h3 className="text-xl font-bold text-white">Project Files</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Store, organize, and securely share documents, images, builds, and deliverables from one place.
              </p>
            </motion.div>

          </div>

          {/* ROW 4: 3 Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 7: Living Documentation */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="group p-6 sm:p-7 bg-[rgba(15,15,18,0.85)] border border-zinc-800/80 rounded-lg backdrop-blur-2xl shadow-xl hover:border-zinc-700 hover:scale-[1.01] transition-all duration-200 space-y-4"
            >
              <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:-translate-y-1 transition-transform duration-200">
                <HugeiconsIcon icon={File01Icon} size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">Living Documentation</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Create structured documentation that evolves alongside your project and remains accessible to clients.
              </p>
            </motion.div>

            {/* Card 8: Project Activity */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="group p-6 sm:p-7 bg-[rgba(15,15,18,0.85)] border border-zinc-800/80 rounded-lg backdrop-blur-2xl shadow-xl hover:border-zinc-700 hover:scale-[1.01] transition-all duration-200 space-y-4"
            >
              <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:-translate-y-1 transition-transform duration-200">
                <HugeiconsIcon icon={Clock01Icon} size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">Project Activity</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Every meaningful update is recorded in a clear chronological history for complete transparency.
              </p>
            </motion.div>

            {/* Card 9: Secure Share Links */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: 0.15 }}
              className="group p-6 sm:p-7 bg-[rgba(15,15,18,0.85)] border border-zinc-800/80 rounded-lg backdrop-blur-2xl shadow-xl hover:border-zinc-700 hover:scale-[1.01] transition-all duration-200 space-y-4"
            >
              <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:-translate-y-1 transition-transform duration-200">
                <HugeiconsIcon icon={LockKeyIcon} size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">Secure Share Links</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Generate private, time-limited project links with optional password protection for safe client access.
              </p>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
