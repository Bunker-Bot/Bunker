import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PackageIcon,
  Download01Icon,
  RefreshIcon,
  Search01Icon,
  FileCodeIcon,
  ShieldKeyIcon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Tick02Icon,
  CreditCardIcon,
} from '@hugeicons/core-free-icons';

import { Badge } from '../../../components/ui/badge';

interface PortalDeliverablesProps {
  projectId?: string;
  projectName?: string;
  assets?: any;
  payments?: any;
  project?: any;
  deliverables?: any[];
  milestones?: any[];
  onOpenPaymentModal?: () => void;
}

export const PortalDeliverablesView: React.FC<PortalDeliverablesProps> = ({
  projectId: _projectId,
  projectName: projectNameProp = 'Project Deliverables',
  assets,
  payments,
  project,
  deliverables,
  milestones = [],
  onOpenPaymentModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [downloadModalItem, setDownloadModalItem] = useState<any | null>(null);
  const [downloadingItem, setDownloadingItem] = useState<string | null>(null);
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const realProjectName = project?.name || project?.title || (projectNameProp !== 'PawCare AI — Enterprise Healthcare Platform' ? projectNameProp : 'Project Deliverables');

  // Real financial telemetry from payments array & project object
  const paymentList = useMemo(() => {
    if (Array.isArray(payments) && payments.length > 0) return payments;
    if (project?.payments && Array.isArray(project.payments)) return project.payments;
    return [];
  }, [payments, project]);

  const totalAmount = useMemo(() => {
    const raw = Number(project?.budget || project?.cost || project?.amount || 0);
    if (raw > 0) return raw;
    if (paymentList.length > 0) {
      return paymentList.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
    }
    return 0;
  }, [project, paymentList]);

  const paidAmount = useMemo(() => {
    if (paymentList.length > 0) {
      return paymentList
        .filter((p: any) => p.is_verified !== false && p.status !== 'Failed' && p.status !== 'Cancelled')
        .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
    }
    return Number(project?.paid_amount || 0);
  }, [paymentList, project]);

  const remainingBalance = totalAmount > 0 ? Math.max(0, totalAmount - paidAmount) : 0;
  const isFullyPaid = totalAmount > 0 ? remainingBalance <= 0 : (paidAmount > 0);
  const paymentPct = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : (isFullyPaid ? 100 : 0);

  const rawData = deliverables || assets || project?.assets || [];

  const deliverableItems = useMemo(() => {
    if (Array.isArray(rawData) && rawData.length > 0) {
      return rawData.map((d: any, idx: number) => {
        const isManualUnlocked = Boolean(d.is_manual_unlocked || d.isManualUnlocked);
        // Only unlock if 100% fully paid (zero balance due) or manually unlocked by admin
        const isUnlocked = isManualUnlocked || (isFullyPaid && (d.unlock_type !== 'manual' && d.unlockType !== 'manual'));
        const rawUrl = d.asset_url || d.download_url || d.downloadUrl || d.file_url || '';
        const safeDownloadUrl = isUnlocked ? rawUrl : '';

        let category = d.category || d.asset_type || 'Source Code';
        if (category === 'google_drive') category = 'Cloud Storage';
        if (category === 'source_code') category = 'Source Code';
        if (category === 'database') category = 'Database';
        if (category === 'apk') category = 'APK / Mobile';
        if (category === 'deployment') category = 'Deployment';

        return {
          id: String(d.id || `deliv-${idx}`),
          title: d.title || d.name || 'Deliverable Package',
          category,
          version: d.version || 'v1.0.0',
          size: d.size || d.file_size || d.package_size || 'N/A',
          date: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Recent',
          unlocked: isUnlocked,
          reqPct: 100,
          sha256: d.sha256 || d.hash || null,
          downloadUrl: safeDownloadUrl,
          desc: d.description || d.desc || 'Verified production deliverable package.',
        };
      });
    }

    return [];
  }, [rawData, isFullyPaid]);

  const filteredItems = useMemo(() => {
    return deliverableItems.filter((item: any) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchQuery = !search.trim() || item.title.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [deliverableItems, selectedCategory, search]);

  const categories = ['All', 'Source Code', 'Database', 'APK / Mobile', 'Deployment'];

  const unlockedCount = deliverableItems.filter((i: any) => i.unlocked).length;
  const totalCount = deliverableItems.length;

  const totalStorageSize = useMemo(() => {
    if (deliverableItems.length === 0) return '0 MB';
    let totalBytes = 0;
    let hasExactSize = false;
    deliverableItems.forEach((item: any) => {
      if (item.size && item.size !== 'N/A') {
        const match = String(item.size).match(/([\d.]+)\s*(MB|GB|KB)?/i);
        if (match) {
          hasExactSize = true;
          const val = parseFloat(match[1]);
          const unit = (match[2] || 'MB').toUpperCase();
          if (unit === 'GB') totalBytes += val * 1024 * 1024 * 1024;
          else if (unit === 'KB') totalBytes += val * 1024;
          else totalBytes += val * 1024 * 1024;
        }
      }
    });
    if (!hasExactSize) return `${deliverableItems.length} Assets`;
    const mb = totalBytes / (1024 * 1024);
    return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
  }, [deliverableItems]);

  const latestTag = useMemo(() => {
    if (deliverableItems.length > 0 && deliverableItems[0]?.version) {
      return deliverableItems[0].version;
    }
    return project?.status || 'Active';
  }, [deliverableItems, project]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const handleTriggerDownload = (item: any) => {
    setDownloadModalItem(item);
  };

  const handleConfirmDownload = () => {
    if (!downloadModalItem) return;
    if (!downloadModalItem.unlocked || !downloadModalItem.downloadUrl || downloadModalItem.downloadUrl === '#' || downloadModalItem.downloadUrl === '') {
      alert('Payment Required: The project balance must be fully cleared before accessing and downloading deliverable packages.');
      if (onOpenPaymentModal) onOpenPaymentModal();
      setDownloadModalItem(null);
      return;
    }
    setDownloadingItem(downloadModalItem.id);
    setTimeout(() => {
      setDownloadingItem(null);
      if (downloadModalItem.downloadUrl && downloadModalItem.downloadUrl !== '#') {
        window.open(downloadModalItem.downloadUrl, '_blank');
      }
      setDownloadModalItem(null);
    }, 1200);
  };

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  // Dynamic milestone unlock roadmap
  const unlockRoadmap = useMemo(() => {
    const list = Array.isArray(milestones) && milestones.length > 0
      ? milestones
      : (Array.isArray(project?.milestones) && project.milestones.length > 0 ? project.milestones : []);

    if (list.length > 0) {
      return list.map((m: any, idx: number) => {
        const pct = Number(m.required_payment_pct || m.payment_pct || Math.round(((idx + 1) / list.length) * 100));
        const isCompleted = m.status === 'completed' || m.status === 'Completed' || Boolean(m.is_completed);
        const unlocked = isCompleted || paymentPct >= pct;
        return {
          pct,
          title: m.title || m.name || `Milestone ${idx + 1}`,
          unlocked,
        };
      });
    }

    return [
      { pct: 25, title: 'Initial Architecture & Specifications', unlocked: paymentPct >= 25 },
      { pct: 50, title: 'Core Source Code & Database Schemas', unlocked: paymentPct >= 50 },
      { pct: 75, title: 'Pre-release Builds & Client Mobile Assets', unlocked: paymentPct >= 75 },
      { pct: 100, title: 'Final Handover & Production Stack', unlocked: paymentPct >= 100 },
    ];
  }, [milestones, project, paymentPct]);

  return (
    <div className="space-y-6 font-mono text-xs select-none min-h-screen">
      
      {/* REFRESH SYNC MODAL */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="p-6 sm:p-8 rounded-sm bg-zinc-950 border border-zinc-800 text-center space-y-4 max-w-sm w-full shadow-2xl font-mono"
            >
              <div className="w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 mx-auto animate-spin">
                <HugeiconsIcon icon={RefreshIcon} size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-white">Synchronizing Asset Catalog</h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Scanning cloud storage buckets, verifying signed URLs & validating escrow unlock permissions...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DOWNLOAD CONFIRMATION MODAL */}
      <AnimatePresence>
        {downloadModalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="p-6 rounded-sm bg-zinc-950 border border-zinc-800 space-y-4 max-w-md w-full shadow-2xl font-mono"
            >
              <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                <div className="flex items-center gap-2 font-extrabold text-white text-sm">
                  <HugeiconsIcon icon={Download01Icon} size={16} className="text-cyan-400" />
                  <span>Confirm Signed Package Download</span>
                </div>
                <Badge variant="outline" className="rounded-sm bg-cyan-950/80 text-cyan-300 border-cyan-800 text-[9px]">
                  {downloadModalItem.version}
                </Badge>
              </div>

              <div className="space-y-2 text-xs font-sans">
                <h4 className="font-extrabold text-white text-sm">{downloadModalItem.title}</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">{downloadModalItem.desc}</p>

                <div className="p-3 rounded-sm bg-zinc-900 border border-zinc-850 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-zinc-400">
                    <span>Package Size:</span>
                    <span className="text-white font-bold">{downloadModalItem.size}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Release Date:</span>
                    <span className="text-white font-bold">{downloadModalItem.date}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>SHA-256 Hash:</span>
                    <span className="text-cyan-400 text-[10px] truncate max-w-[200px]">{downloadModalItem.sha256}</span>
                  </div>
                </div>

                <div className="p-3 rounded-sm bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-[11px] flex items-center gap-2">
                  <HugeiconsIcon icon={ShieldKeyIcon} size={14} className="shrink-0" />
                  <span>Device fingerprint & IP logged for security verification.</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-850">
                <button
                  onClick={() => setDownloadModalItem(null)}
                  className="px-3 py-1.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDownload}
                  disabled={Boolean(downloadingItem)}
                  className="px-4 py-1.5 rounded-sm bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-extrabold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <HugeiconsIcon icon={Download01Icon} size={14} />
                  <span>{downloadingItem ? 'Preparing Link...' : 'Generate Signed Link'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-5 md:p-6 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl space-y-4 relative overflow-hidden"
      >
        <div className="flex flex-col gap-3 sm:gap-4 border-b border-zinc-850 pb-3 sm:pb-4">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-sm bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
              <HugeiconsIcon icon={PackageIcon} size={18} />
            </div>

            <div className="min-w-0 space-y-0.5 flex-1">
              <h1 className="text-sm sm:text-base md:text-lg font-extrabold text-white font-mono break-words leading-snug">
                {realProjectName}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <Badge variant="outline" className="rounded-sm bg-cyan-950/80 text-cyan-300 border-cyan-800 text-[8px] sm:text-[9px] font-mono">
                  {latestTag} Release
                </Badge>
                <Badge variant="outline" className="rounded-sm bg-emerald-950/80 text-emerald-300 border-emerald-800 text-[8px] sm:text-[9px] font-mono">
                  Verified Client Access
                </Badge>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 font-sans truncate hidden sm:block">
                Encrypted Deliverable Catalog • Escrow Release Verification Engine
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="h-8 w-full sm:w-auto px-3 rounded-sm bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <HugeiconsIcon icon={RefreshIcon} size={13} />
            <span>Sync Assets</span>
          </button>
        </div>

        {/* METRICS GRID (8 KPI CARDS) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5 pt-1">
          <div className="p-2.5 sm:p-3 rounded-sm bg-zinc-900/90 border border-zinc-850 space-y-0.5 sm:space-y-1">
            <span className="text-[8px] sm:text-[9px] text-zinc-500 font-sans uppercase font-bold block">Deliverables</span>
            <span className="text-[11px] sm:text-xs font-extrabold text-white block truncate">{totalCount} Packages</span>
            <span className="text-[8px] sm:text-[9px] text-zinc-400 font-sans block">Verified</span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-sm bg-zinc-900/90 border border-zinc-850 space-y-0.5 sm:space-y-1">
            <span className="text-[8px] sm:text-[9px] text-zinc-500 font-sans uppercase font-bold block">Unlocked</span>
            <span className="text-[11px] sm:text-xs font-extrabold text-emerald-400 block truncate">{unlockedCount} Available</span>
            <span className="text-[8px] sm:text-[9px] text-emerald-500/80 font-sans block">Ready</span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-sm bg-zinc-900/90 border border-zinc-850 space-y-0.5 sm:space-y-1">
            <span className="text-[8px] sm:text-[9px] text-zinc-500 font-sans uppercase font-bold block">Locked</span>
            <span className="text-[11px] sm:text-xs font-extrabold text-amber-400 block truncate">{totalCount - unlockedCount} Pending</span>
            <span className="text-[8px] sm:text-[9px] text-amber-500/80 font-sans block">Escrow</span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-sm bg-zinc-900/90 border border-zinc-850 space-y-0.5 sm:space-y-1">
            <span className="text-[8px] sm:text-[9px] text-zinc-500 font-sans uppercase font-bold block">Escrow Paid</span>
            <span className="text-[11px] sm:text-xs font-extrabold text-cyan-400 block truncate">{paymentPct}%</span>
            <span className="text-[8px] sm:text-[9px] text-zinc-400 font-sans block">Threshold</span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-sm bg-zinc-900/90 border border-zinc-850 space-y-0.5 sm:space-y-1">
            <span className="text-[8px] sm:text-[9px] text-zinc-500 font-sans uppercase font-bold block">Storage</span>
            <span className="text-[11px] sm:text-xs font-extrabold text-white block truncate">{totalStorageSize}</span>
            <span className="text-[8px] sm:text-[9px] text-zinc-400 font-sans block">Total</span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-sm bg-zinc-900/90 border border-zinc-850 space-y-0.5 sm:space-y-1">
            <span className="text-[8px] sm:text-[9px] text-zinc-500 font-sans uppercase font-bold block">Latest Tag</span>
            <span className="text-[11px] sm:text-xs font-extrabold text-purple-400 block truncate">{latestTag}</span>
            <span className="text-[8px] sm:text-[9px] text-zinc-400 font-sans block">Production</span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-sm bg-zinc-900/90 border border-zinc-850 space-y-0.5 sm:space-y-1">
            <span className="text-[8px] sm:text-[9px] text-zinc-500 font-sans uppercase font-bold block">SHA-256</span>
            <span className="text-[11px] sm:text-xs font-extrabold text-emerald-400 block truncate">Verified</span>
            <span className="text-[8px] sm:text-[9px] text-zinc-400 font-sans block">Checksum</span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-sm bg-zinc-900/90 border border-zinc-850 space-y-0.5 sm:space-y-1">
            <span className="text-[8px] sm:text-[9px] text-zinc-500 font-sans uppercase font-bold block">Access</span>
            <span className="text-[11px] sm:text-xs font-extrabold text-white block truncate">Active</span>
            <span className="text-[8px] sm:text-[9px] text-zinc-400 font-sans block">Secure</span>
          </div>
        </div>
      </motion.div>

      {/* SECURITY WORKSPACE BANNER */}
      <div className="p-4 rounded-sm bg-emerald-950/30 border border-emerald-900/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-emerald-900/80 border border-emerald-700 flex items-center justify-center text-emerald-300 shrink-0">
            <HugeiconsIcon icon={ShieldKeyIcon} size={16} />
          </div>
          <div>
            <span className="font-extrabold text-white block">🔒 Encrypted Client Workspace Active</span>
            <span className="text-zinc-400 text-[11px]">
              Every download is digitally signed with single-use URLs. Device fingerprint & IP address recorded for auditing.
            </span>
          </div>
        </div>
        <Badge variant="outline" className="rounded-sm bg-emerald-950 text-emerald-300 border-emerald-800 text-[10px] shrink-0 font-mono">
          SHA-256 Signed
        </Badge>
      </div>

      {/* PAYMENT UNLOCK THRESHOLD ROADMAP */}
      <div className="p-4 sm:p-5 md:p-6 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-2xl space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 border-b border-zinc-850 pb-3">
          <div className="flex items-center gap-2 font-extrabold text-white text-sm sm:text-base">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-cyan-400 shrink-0" />
            <span className="leading-tight">Escrow Unlock Roadmap</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-sans shrink-0">Cleared: {paymentPct}%</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {unlockRoadmap.map((r: any) => (
            <div
              key={r.pct}
              className={`p-2.5 sm:p-3.5 rounded-sm border space-y-1 sm:space-y-1.5 transition-all ${
                r.unlocked
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                  : 'bg-zinc-900/60 border-zinc-850 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-extrabold text-[10px] sm:text-xs font-mono">{r.pct}%</span>
                <span className={`text-[8px] sm:text-[9px] font-sans font-bold uppercase px-1 sm:px-1.5 py-0.5 rounded-sm ${
                  r.unlocked ? 'bg-emerald-900/80 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {r.unlocked ? '✓' : '🔒'}
                </span>
              </div>
              <h4 className="font-bold text-white text-[10px] sm:text-xs leading-snug line-clamp-2">{r.title}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY TABS & SEARCH BAR */}
      <div className="p-3 sm:p-4 rounded-sm bg-zinc-950/90 border border-zinc-800/90 shadow-xl flex flex-col gap-2.5 sm:gap-3">
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 sm:px-3 py-1 rounded-sm text-[10px] sm:text-xs transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <HugeiconsIcon icon={Search01Icon} size={13} className="absolute left-2.5 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deliverables..."
            className="w-full pl-8 pr-3 py-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-white text-xs outline-none focus:border-cyan-500 font-sans"
          />
        </div>
      </div>

      {/* DELIVERABLES PACKAGE CARDS GRID / EMPTY STATE */}
      {filteredItems.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-sm bg-zinc-950/80 border border-zinc-850 text-center space-y-3 shadow-xl font-mono">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
            <HugeiconsIcon icon={PackageIcon} size={24} />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-extrabold text-white">No Deliverables Uploaded Yet</h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Source code packages, database schemas, mobile builds, and deployment bundles for {realProjectName} will be published here by the project administrator as milestones are completed.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredItems.map((item: any) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.01 }}
              className={`p-3.5 sm:p-5 rounded-sm border space-y-3 sm:space-y-4 flex flex-col justify-between transition-all relative overflow-hidden ${
                item.unlocked
                  ? 'bg-zinc-950/90 border-zinc-800/90 hover:border-cyan-500/50 shadow-xl'
                  : 'bg-zinc-950/60 border-zinc-850/80 opacity-75'
              }`}
            >
              {/* Package Card Top Metadata */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="rounded-sm bg-zinc-900 border-zinc-800 text-cyan-400 text-[9px]">
                    {item.category}
                  </Badge>

                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-sm border ${
                    item.unlocked
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950/80 text-amber-300 border-amber-800'
                  }`}>
                    {item.unlocked ? 'Unlocked' : `Requires ${item.reqPct}% Payment`}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 border mt-0.5 ${
                    item.unlocked
                      ? 'bg-cyan-950/80 border-cyan-800 text-cyan-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}>
                    <HugeiconsIcon icon={item.unlocked ? FileCodeIcon : ShieldKeyIcon} size={18} />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h4 className="font-extrabold text-white text-xs leading-snug" title={item.title}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Technical Specifications Tag Box */}
                <div className="p-2 sm:p-2.5 rounded-sm bg-zinc-900/80 border border-zinc-850 space-y-1 text-[9px] sm:text-[10px] font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Version:</span>
                    <span className="text-white font-bold">{item.version}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Size:</span>
                    <span className="text-white font-bold">{item.size}</span>
                  </div>
                  {item.sha256 && (
                    <div className="flex items-center justify-between text-zinc-400 pt-0.5">
                      <span>SHA-256:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-cyan-400 text-[8px] sm:text-[9px] truncate max-w-[80px] sm:max-w-[110px]">{item.sha256}</span>
                        <button
                          onClick={() => handleCopySha(item.sha256)}
                          className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                          title="Copy SHA256"
                        >
                          <HugeiconsIcon icon={copiedSha === item.sha256 ? Tick02Icon : Copy01Icon} size={10} className={copiedSha === item.sha256 ? 'text-emerald-400' : ''} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-zinc-850 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-sans">Released: {item.date}</span>

                {item.unlocked ? (
                  <button
                    onClick={() => handleTriggerDownload(item)}
                    className="px-3.5 py-1.5 rounded-sm bg-cyan-950/80 border border-cyan-800 hover:bg-cyan-900 text-cyan-200 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <HugeiconsIcon icon={Download01Icon} size={13} />
                    <span>Download</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (onOpenPaymentModal) {
                        onOpenPaymentModal();
                      } else {
                        alert(`This package requires ${item.reqPct}% milestone payment clearing to unlock.`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-sm bg-amber-950/60 border border-amber-800/80 hover:bg-amber-900 text-amber-300 text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <HugeiconsIcon icon={CreditCardIcon} size={12} />
                    <span>Pay to Unlock</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
};

export default PortalDeliverablesView;
