import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserGroupIcon,
  SecurityCheckIcon,
  Share01Icon,
  ActivityIcon,
  CheckmarkCircle01Icon,
  LockKeyIcon,
  GitBranchIcon,
  Folder01Icon,
  SparklesIcon,
  ShieldKeyIcon
} from '@hugeicons/core-free-icons';
import { HeroSignatureBackground } from '../components/landing/HeroSignatureBackground';

export const PortalShowcaseSection: React.FC = () => {
  return (
    <section id="portal-showcase" className="scroll-mt-20 relative w-full py-24 border-t border-zinc-800/80 bg-[#050505] overflow-hidden">
      
      {/* Signature Bunker Monochrome Architectural Background */}
      <HeroSignatureBackground />

      {/* Main Interactive Container */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* LEFT COLUMN (40%): Title, Description, 4 Key Benefits & Security Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="lg:col-span-5 space-y-8 text-left"
          >
            {/* Section Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl text-xs text-zinc-300 shadow-xl">
              <HugeiconsIcon icon={SparklesIcon} size={14} className="text-zinc-300 animate-pulse" />
              <span className="font-medium">Client Portal</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
              Every client receives a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                beautiful project portal
              </span>
            </h2>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
              Clients can securely monitor project progress, milestones, files, and updates without needing to install anything or create an account.
            </p>

            {/* 4 Key Benefits List */}
            <div className="space-y-4 pt-2">
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shrink-0 shadow-md">
                  <HugeiconsIcon icon={UserGroupIcon} size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">No Client Account Required</h4>
                  <p className="text-xs text-zinc-400">Clients open share links instantly without signups or passwords.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shrink-0 shadow-md">
                  <HugeiconsIcon icon={SecurityCheckIcon} size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Secure Read-Only Access</h4>
                  <p className="text-xs text-zinc-400">Protected by PostgreSQL RLS with short-lived session tokens.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shrink-0 shadow-md">
                  <HugeiconsIcon icon={Share01Icon} size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Share in Seconds</h4>
                  <p className="text-xs text-zinc-400">Generate private links with optional expiration and password locks.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shrink-0 shadow-md">
                  <HugeiconsIcon icon={ActivityIcon} size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Real-Time Project Updates</h4>
                  <p className="text-xs text-zinc-400">Automated GitHub sync, milestones, and activity history in one view.</p>
                </div>
              </div>

            </div>

            {/* Security Trust Badge Card */}
            <div className="p-4 bg-[rgba(15,15,18,0.92)] border border-zinc-800/90 rounded-lg backdrop-blur-2xl space-y-2 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                <HugeiconsIcon icon={ShieldKeyIcon} size={16} className="text-white" />
                <span>Zero-Trust PostgreSQL Security</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400 pt-1">
                <span className="flex items-center gap-1"><HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="text-white" /> Read-Only</span>
                <span className="flex items-center gap-1"><HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="text-white" /> Password Option</span>
                <span className="flex items-center gap-1"><HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="text-white" /> JWT Tokenized</span>
                <span className="flex items-center gap-1"><HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="text-white" /> Auto Expiration</span>
              </div>
            </div>

          </motion.div>

          {/* RIGHT COLUMN (60%): Handcrafted Interactive Client Portal Desktop Window Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-7 relative"
          >
            {/* Floating Glass Chips Around Window */}
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: [ -10, 5, -10 ] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="hidden sm:flex absolute -top-5 -right-4 z-20 items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-900/95 border border-zinc-700/80 backdrop-blur-xl text-xs font-mono text-white shadow-2xl"
            >
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-white" />
              <span>Deliverable Signed Off</span>
            </motion.div>

            <motion.div
              initial={{ y: 10 }}
              animate={{ y: [ 10, -5, 10 ] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="hidden sm:flex absolute -bottom-5 -left-4 z-20 items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-900/95 border border-zinc-700/80 backdrop-blur-xl text-xs font-mono text-zinc-300 shadow-2xl"
            >
              <HugeiconsIcon icon={GitBranchIcon} size={14} className="text-white" />
              <span>GitHub #1407 Pushed</span>
            </motion.div>

            {/* Main Handcrafted Desktop Portal Window Container */}
            <div className="bg-[rgba(15,15,18,0.92)] border border-zinc-800/90 rounded-lg p-5 sm:p-7 backdrop-blur-2xl shadow-2xl space-y-5 overflow-hidden">
              
              {/* Portal Window Top Header Bar */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600" />
                </div>

                <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] font-mono text-zinc-300">
                  <HugeiconsIcon icon={LockKeyIcon} size={12} className="text-zinc-400" />
                  <span>portal.bunker.app/share/3f8e9a2b</span>
                </div>

                <span className="text-[10px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Read-Only
                </span>
              </div>

              {/* Mockup Dashboard Body Grid */}
              <div className="space-y-4">
                
                {/* Mockup Card 1: Project Progress Header */}
                <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-lg space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Aetheria Cloud Portal</h4>
                      <p className="text-[11px] text-zinc-400">Client Portal for Aetheria Systems</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-lg">
                      78% Completed
                    </span>
                  </div>

                  <div className="w-full bg-zinc-800 h-2 rounded-lg overflow-hidden">
                    <div className="w-[78%] h-full bg-white rounded-lg" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-0.5">
                    <span>Deadline: Aug 15, 2026</span>
                    <span className="text-white">Status: On Schedule</span>
                  </div>
                </div>

                {/* Mockup Grid: Milestones & GitHub Sync */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Milestones Widget */}
                  <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-lg space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between text-xs font-bold text-white border-b border-zinc-800/80 pb-2">
                      <span>Active Milestones</span>
                      <span className="text-[10px] text-zinc-400 font-normal">2 of 3 Completed</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="p-2 rounded bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-between text-zinc-200">
                        <span className="flex items-center gap-1.5">
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={13} className="text-white" />
                          Phase 1: Backend & RLS
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400">Done</span>
                      </div>

                      <div className="p-2 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between text-zinc-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          Phase 2: Client Portal
                        </span>
                        <span className="text-[9px] font-mono text-white font-semibold">Active</span>
                      </div>
                    </div>
                  </div>

                  {/* GitHub Sync Widget */}
                  <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-lg space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between text-xs font-bold text-white border-b border-zinc-800/80 pb-2">
                      <span className="flex items-center gap-1.5">
                        <HugeiconsIcon icon={GitBranchIcon} size={14} className="text-white" />
                        GitHub Sync
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">main</span>
                    </div>

                    <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded text-[11px] font-mono space-y-1">
                      <div className="text-zinc-200 truncate">feat: add RLS token exchange</div>
                      <div className="flex justify-between text-[9px] text-zinc-500">
                        <span>#1407 pushed</span>
                        <span>2m ago</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Mockup Deliverable Files Bar */}
                <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center justify-between text-xs font-mono shadow-md">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <HugeiconsIcon icon={Folder01Icon} size={15} className="text-white" />
                    <span>v1.0-architecture-spec.pdf</span>
                  </div>
                  <span className="text-[10px] bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-white cursor-pointer">
                    Download File
                  </span>
                </div>

              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default PortalShowcaseSection;
