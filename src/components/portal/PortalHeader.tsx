import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  LockKeyIcon,
  Download01Icon,
  UserIcon,
  Clock01Icon,
  Building01Icon,
  GitBranchIcon,
  DocumentCodeIcon,
  MoneyBagIcon,
  PackageIcon
} from '@hugeicons/core-free-icons';
import { AppLogo } from '../ui/AppLogo';
import { Badge } from '../ui/badge';

export interface PortalModuleDef {
  id: string;
  label: string;
  icon: any;
}

export const PORTAL_ALL_MODULES: PortalModuleDef[] = [
  { id: 'overview', label: 'Overview', icon: Building01Icon },
  { id: 'timeline', label: 'Timeline', icon: Clock01Icon },
  { id: 'documentation', label: 'Documentation', icon: DocumentCodeIcon },
  { id: 'github', label: 'GitHub', icon: GitBranchIcon },
  { id: 'finance', label: 'Finance', icon: MoneyBagIcon },
  { id: 'deliverables', label: 'Deliverables', icon: PackageIcon },
  { id: 'downloads', label: 'Downloads', icon: Download01Icon },
];

interface PortalHeaderProps {
  projectName: string;
  projectStatus?: string;
  allowedModules: string[];
  activeModule: string;
  onSelectModule: (id: string) => void;
  progressPercent: number;
  expiresAt?: string | null;
  remainingAmount?: number;
  currencySymbol?: string;
  onOpenPaymentModal?: () => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  projectName,
  projectStatus = 'Active',
  allowedModules,
  activeModule,
  onSelectModule,
  progressPercent,
  expiresAt,
  remainingAmount = 0,
  currencySymbol = '₹',
  onOpenPaymentModal,
}) => {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  // Filter navigation items to ONLY show allowed modules
  const visibleModules = PORTAL_ALL_MODULES.filter((m) =>
    allowedModules.length === 0 || allowedModules.includes(m.id) || allowedModules.includes('all')
  );

  return (
    <header className="fixed top-0 left-0 right-0 h-[72px] border-b border-zinc-800/90 bg-[#09090b]/95 backdrop-blur-2xl z-40 flex items-center justify-between px-3 sm:px-6 font-mono select-none shadow-xl">
      {/* Left: Company Logo, Project Name & Status */}
      <div className="flex items-center gap-3 min-w-0 shrink-0">
        <AppLogo size={28} showText={false} />
        <div className="h-5 w-[1px] bg-zinc-800 hidden xs:block" />

        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-[120px] sm:max-w-[200px]">
            {projectName}
          </h2>
          <Badge variant="outline" className="rounded-sm bg-cyan-950/80 text-cyan-300 border-cyan-800 text-[10px] uppercase font-bold hidden sm:inline-flex shrink-0">
            {projectStatus}
          </Badge>
          <Badge variant="outline" className="rounded-sm bg-emerald-950/80 text-emerald-300 border-emerald-800 text-[10px] font-bold shrink-0 hidden md:inline-flex items-center gap-1">
            <HugeiconsIcon icon={LockKeyIcon} size={11} />
            <span>Client Portal</span>
          </Badge>
        </div>
      </div>

      {/* Center: Module Navigation Bar (Allowed Modules Only) */}
      <nav className="hidden lg:flex items-center gap-1 p-1 rounded-sm bg-zinc-950/90 border border-zinc-850 shadow-inner">
        {visibleModules.map((mod) => {
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <HugeiconsIcon icon={mod.icon} size={13} className={isActive ? 'text-cyan-400' : 'text-zinc-500'} />
              <span>{mod.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Metrics, Download Menu & Viewer Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Pay Balance / Unlock Project Action Button */}
        {remainingAmount > 0 && onOpenPaymentModal && (
          <button
            onClick={onOpenPaymentModal}
            className="h-8 px-2.5 rounded-sm bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 border border-amber-600/60 hover:border-amber-500 text-amber-300 hover:text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
            title="Open Payment & Deliverable Unlock Center"
          >
            <HugeiconsIcon icon={LockKeyIcon} size={13} className="text-amber-400" />
            <span className="hidden xs:inline">Pay {currencySymbol}{remainingAmount.toLocaleString()}</span>
            <span className="xs:hidden">Pay</span>
          </button>
        )}

        {/* Progress Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-950 border border-zinc-850 text-xs">
          <span className="text-[10px] text-zinc-500 font-sans uppercase">Progress</span>
          <strong className="text-emerald-400 font-bold">{progressPercent}%</strong>
        </div>

        {/* Expiration Indicator */}
        {expiresAt && (
          <div className="hidden md:flex items-center gap-1 text-[10px] text-amber-400/90 bg-amber-950/40 border border-amber-900/60 px-2 py-1 rounded">
            <HugeiconsIcon icon={Clock01Icon} size={11} />
            <span>Expires {new Date(expiresAt).toLocaleDateString()}</span>
          </div>
        )}

        {/* Download Menu */}
        <div className="relative">
          <button
            onClick={() => setIsDownloadOpen(!isDownloadOpen)}
            className="h-8 px-2.5 rounded-sm bg-zinc-850 border border-zinc-750 text-zinc-200 hover:text-white font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
            title="Download Menu"
          >
            <HugeiconsIcon icon={Download01Icon} size={14} />
            <span className="hidden xs:inline">Assets</span>
          </button>

          {isDownloadOpen && (
            <div className="absolute right-0 top-10 w-48 p-2 rounded-sm bg-zinc-950 border border-zinc-800 shadow-2xl z-50 space-y-1 font-mono text-xs">
              <span className="text-[10px] text-zinc-500 uppercase font-bold px-2 block">Quick Downloads</span>
              <button
                onClick={() => {
                  setIsDownloadOpen(false);
                  onSelectModule('downloads');
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-zinc-900 text-zinc-300 hover:text-white block cursor-pointer"
              >
                Go to Downloads Hub
              </button>
              <button
                onClick={() => {
                  setIsDownloadOpen(false);
                  onSelectModule('deliverables');
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-zinc-900 text-zinc-300 hover:text-white block cursor-pointer"
              >
                Unlocked Deliverables
              </button>
            </div>
          )}
        </div>

        {/* Read-Only Viewer Avatar */}
        <div className="flex items-center gap-2 p-1 pl-2 rounded bg-zinc-950 border border-zinc-850 text-xs">
          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
            <HugeiconsIcon icon={UserIcon} size={13} />
          </div>
          <span className="text-[10px] font-bold text-zinc-300 hidden sm:inline">Viewer</span>
        </div>
      </div>
    </header>
  );
};
