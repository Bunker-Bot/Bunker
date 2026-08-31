import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  GitBranchIcon,
  CheckmarkCircle01Icon,
  Share01Icon,
  SecurityCheckIcon,
  LockKeyIcon,
  ActivityIcon
} from '@hugeicons/core-free-icons';

export const ProductPreviewShowcase: React.FC = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-none">
      {/* Background Ambient Glow behind Preview */}
      <div className="absolute -inset-4 bg-gradient-to-r from-zinc-800/20 via-zinc-700/10 to-zinc-800/20 rounded-sm blur-3xl opacity-50 pointer-events-none" />

      {/* Main Monochrome Glass Application Container */}
      <div className="relative bg-[rgba(15,15,18,0.88)] border border-zinc-800/90 rounded-sm p-4 sm:p-6 backdrop-blur-2xl shadow-2xl overflow-hidden space-y-5">

        {/* Top Window Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600" />
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-sm text-[11px] font-mono text-zinc-300">
            <HugeiconsIcon icon={LockKeyIcon} size={12} className="text-zinc-400" />
            <span>portal.bunker.app/share/3f8e9a2b</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live Client View
          </div>
        </div>

        {/* Inner Dashboard Layout Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Card 1: Project Overview */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-sm space-y-3 shadow-lg hover:border-zinc-700 hover:scale-[1.01] transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Aetheria Cloud Portal</h4>
                <p className="text-[10px] text-zinc-400">Client: Aetheria Systems</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-white bg-zinc-800 px-2 py-0.5 rounded-sm border border-zinc-700">
                78% Done
              </span>
            </div>

            {/* Monochrome Progress Bar */}
            <div className="w-full bg-zinc-800 h-1.5 rounded-sm overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '78%' }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="h-full bg-white rounded-sm"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1">
              <span>Deadline: Aug 15</span>
              <span className="text-zinc-300">On Schedule</span>
            </div>
          </motion.div>

          {/* Card 2: GitHub Realtime Sync */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-sm space-y-3 shadow-lg hover:border-zinc-700 hover:scale-[1.01] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <HugeiconsIcon icon={GitBranchIcon} size={14} className="text-zinc-300" />
                <span>GitHub Sync</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">main</span>
            </div>

            <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-sm space-y-1 font-mono text-[11px]">
              <div className="text-zinc-200 truncate">feat: add RLS token exchange</div>
              <div className="flex justify-between text-[9px] text-zinc-500">
                <span>#1407 pushed</span>
                <span>2 mins ago</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Card 3: Milestone Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-sm space-y-3 shadow-lg hover:border-zinc-700 hover:scale-[1.01] transition-all"
        >
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-1.5">
              <HugeiconsIcon icon={ActivityIcon} size={14} className="text-zinc-300" />
              Active Milestone Timeline
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">2 of 3 Completed</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-sm bg-zinc-800/80 border border-zinc-700/80 text-zinc-200">
              <span className="flex items-center gap-2">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-white" />
                Phase 1: Backend & Supabase RLS
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Completed</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-sm bg-zinc-950 border border-zinc-800 text-zinc-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Phase 2: Client Portal & Live Share Links
              </span>
              <span className="text-[10px] font-mono text-white font-semibold">In Progress</span>
            </div>
          </div>
        </motion.div>

        {/* Floating Token Exchange Security Pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm flex items-center justify-between text-xs font-mono"
        >
          <div className="flex items-center gap-2 text-zinc-300">
            <HugeiconsIcon icon={SecurityCheckIcon} size={16} className="text-white" />
            <span>Zero-Trust PostgreSQL RLS Active</span>
          </div>
          <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-sm flex items-center gap-1">
            <HugeiconsIcon icon={Share01Icon} size={10} /> 15-min JWT
          </span>
        </motion.div>

      </div>
    </div>
  );
};

export default ProductPreviewShowcase;
