import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  useShareLinks,
  useDisableShareLink,
  useRegenerateShareLink,
  useDeleteShareLink,
} from '../../lib/supabase/queries/share-links';
import { useProjects } from '../../lib/supabase/queries/projects';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import type { FormattedShareLink } from '../../lib/services/share.service';
import { GenerateShareLinkDrawer } from './components/generate-share-link-drawer';
import { ShareLinkCard } from './components/share-link-card';
import { ShareLinkDetailDrawer } from './components/share-link-detail-drawer';
import { ShareLinksAnalytics } from './components/share-links-analytics';
import { PageHeader } from '../../../packages/ui/src/components/page-header';
import { Select } from '../../../packages/ui/src/components/select';
import { RadialSpinner } from '../../components/ui/RadialSpinner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Link01Icon,
  PlusSignIcon,
  Search01Icon,
  Copy01Icon,
  Tick01Icon,
  LockKeyIcon,
  ViewIcon,
  SparklesIcon,
  Globe02Icon,
} from '@hugeicons/core-free-icons';
import { AvatarPoster } from '../../features/identity-avatar';
import { generateAvatarConfig } from '../../features/identity-avatar/lib/avatar-generator';

interface ShareLinksPanelProps {
  projectId?: string;
}

export const ShareLinksPanel: React.FC<ShareLinksPanelProps> = ({
  projectId: initialProjectId,
}) => {
  // Project selection filter (if standalone page)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || 'all');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'disabled' | 'password'>('all');

  // Drawers & Modals state
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<FormattedShareLink | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Success Notification Modal state (shown right after generating a new link)
  const [createdShareUrl, setCreatedShareUrl] = useState<string | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [isCopiedCreatedUrl, setIsCopiedCreatedUrl] = useState(false);
  const [isCopiedCreatedPwd, setIsCopiedCreatedPwd] = useState(false);
  const [showOgPreview, setShowOgPreview] = useState(false);

  // Fetch Projects List for Project Selector
  const { data: projectsResult } = useProjects({ limit: 100 });
  const projects = (projectsResult as any)?.projects || [];

  const projectSelectOptions = useMemo(() => [
    { label: 'All Projects', value: 'all' },
    ...projects.map((p: any) => ({ value: p.id, label: p.name })),
  ], [projects]);

  // Fetch Share Links list
  const { data: links = [], isLoading } = useShareLinks(
    selectedProjectId !== 'all' ? selectedProjectId : undefined
  );

  // Realtime subscription for share_links table
  useRealtimeSubscription({
    table: 'share_links',
    filter: selectedProjectId !== 'all' ? `project_id=eq.${selectedProjectId}` : undefined,
    queryKeyToInvalidate: ['share-links'],
  });

  // Mutations
  const disableMutation = useDisableShareLink();
  const regenerateMutation = useRegenerateShareLink();
  const deleteMutation = useDeleteShareLink();

  // Filter & Search logic
  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      // Search filter
      const matchesSearch =
        !searchQuery.trim() ||
        link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.projectName?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter === 'active') return link.status === 'active';
      if (statusFilter === 'expired') return link.status === 'expired';
      if (statusFilter === 'disabled') return link.status === 'disabled';
      if (statusFilter === 'password') return link.hasPassword;

      return true;
    });
  }, [links, searchQuery, statusFilter]);

  // Copy helper
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  // Toggle status helper
  const handleToggleStatus = (id: string, currentIsActive: boolean) => {
    disableMutation.mutate({ id, currentIsActive });
  };

  // Regenerate token helper
  const handleRegenerate = async (id: string) => {
    if (window.confirm('Regenerate token? The previous share URL will immediately stop working.')) {
      await regenerateMutation.mutateAsync(id);
    }
  };

  // Delete helper
  const handleDelete = async (id: string) => {
    if (window.confirm('Permanently revoke and delete this share link? Client access will be revoked immediately.')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-6 text-zinc-100 font-mono select-none">
      {/* 1. Header (If standalone page) */}
      {!initialProjectId && (
        <PageHeader
          title="Share Links & Client Access Management"
          description="Generate zero-trust, read-only client portal links with module isolation, expiration policies, and access analytics."
          icon={Link01Icon}
          badge="Token Exchange Engine"
          breadcrumbs={[
            { label: 'Workspace', href: '/app/dashboard' },
            { label: 'Share Links' },
          ]}
          actions={
            <div className="flex items-center gap-2 shrink-0">
              <Select
                value={selectedProjectId}
                onChange={setSelectedProjectId}
                options={projectSelectOptions}
                className="w-40 sm:w-48"
              />

              <button
                onClick={() => setIsGenerateOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-sm shrink-0 whitespace-nowrap transition-colors"
              >
                <HugeiconsIcon icon={PlusSignIcon} size={16} />
                <span>Generate Share Link</span>
              </button>
            </div>
          }
        />
      )}

      {/* 2. Lazy Analytics Section */}
      <ShareLinksAnalytics projectId={selectedProjectId} links={links} />

      {/* 3. Search & Filter Toolbar */}
      <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            className="absolute left-3 top-2.5 text-zinc-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by link purpose, token, or project..."
            className="w-full pl-9 pr-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white font-mono text-xs outline-none focus:border-cyan-400 placeholder:text-zinc-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {[
            { id: 'all', label: `All (${links.length})` },
            { id: 'active', label: 'Active' },
            { id: 'expired', label: 'Expired' },
            { id: 'disabled', label: 'Disabled' },
            { id: 'password', label: 'Password Protected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer border ${statusFilter === tab.id
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Share Links List Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-zinc-400 font-mono text-xs space-y-3 bg-zinc-950 rounded border border-zinc-800">
          <RadialSpinner size={24} className="mx-auto text-cyan-400" />
          <p>Loading share link records...</p>
        </div>
      ) : filteredLinks.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredLinks.map((link) => (
              <ShareLinkCard
                key={link.id}
                link={link}
                onCopy={handleCopyUrl}
                onRegenerate={handleRegenerate}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                onSelect={(l) => {
                  setSelectedLink(l);
                  setIsDetailOpen(true);
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="p-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded bg-zinc-950 font-mono text-xs space-y-2">
          <HugeiconsIcon icon={Link01Icon} size={32} className="mx-auto text-zinc-600" />
          <h4 className="font-bold text-white text-sm">No Share Links Found</h4>
          <p className="max-w-md mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'No share links match the selected filter criteria.'
              : 'Generate secure zero-trust links to share project progress with clients.'}
          </p>
        </div>
      )}

      {/* 5. Drawers & Modals */}
      {/* Generate Share Link Drawer */}
      <GenerateShareLinkDrawer
        projectId={selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id || ''}
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onSuccess={(url, pwd) => {
          setCreatedShareUrl(url);
          setCreatedPassword(pwd || null);
        }}
      />

      {/* Share Link Detail Drawer */}
      <ShareLinkDetailDrawer
        link={selectedLink}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      {/* Created Share Link Success Modal */}
      {createdShareUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-sm p-5 space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <HugeiconsIcon icon={Link01Icon} size={18} />
                <span>Share Link & 3D Identity Created</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                Zero-Trust Ready
              </span>
            </div>

            {/* Guardian Identity Summary Banner */}
            <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800 flex items-center gap-3.5 shadow-inner">
              <div className="w-14 h-14 rounded-sm bg-zinc-950 border border-zinc-750 shrink-0 overflow-hidden flex items-center justify-center">
                <AvatarPoster
                  config={generateAvatarConfig({
                    entityId: selectedProjectId !== 'all' ? selectedProjectId : 'default',
                    entityKind: 'project',
                    name: 'Client Project Deliverables',
                  })}
                  size="100%"
                />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                  <HugeiconsIcon icon={SparklesIcon} size={13} />
                  <span>Deterministic Guardian Active</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-snug">
                  Dynamic Open Graph previews (1200×630) and interactive 3D hero portal identity are generated.
                </p>
              </div>
            </div>

            {/* Generated Canonical Share URL */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">Public Share Entry URL</label>
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800">
                <input
                  type="text"
                  readOnly
                  value={createdShareUrl}
                  className="w-full bg-transparent text-cyan-300 font-mono text-xs outline-none truncate"
                />
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(createdShareUrl);
                    setIsCopiedCreatedUrl(true);
                    setTimeout(() => setIsCopiedCreatedUrl(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[10.5px] shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <HugeiconsIcon icon={isCopiedCreatedUrl ? Tick01Icon : Copy01Icon} size={12} className={isCopiedCreatedUrl ? 'text-emerald-400' : ''} />
                  <span>{isCopiedCreatedUrl ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Temporary Password if generated */}
            {createdPassword && (
              <div className="space-y-1 p-3 rounded bg-amber-950/40 border border-amber-800/80">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                  <HugeiconsIcon icon={LockKeyIcon} size={14} />
                  <span>Temporary Password (Shown Once Only)</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono font-bold text-white text-xs select-all">
                    {createdPassword}
                  </span>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(createdPassword);
                      setIsCopiedCreatedPwd(true);
                      setTimeout(() => setIsCopiedCreatedPwd(false), 2000);
                    }}
                    className="px-2 py-1 rounded bg-amber-900/60 hover:bg-amber-900 text-amber-200 text-[10px] font-bold cursor-pointer inline-flex items-center gap-1"
                  >
                    <HugeiconsIcon icon={isCopiedCreatedPwd ? Tick01Icon : Copy01Icon} size={11} />
                    <span>{isCopiedCreatedPwd ? 'Copied' : 'Copy Password'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Optional Inline Open Graph Card Preview */}
            {showOgPreview && (
              <div className="p-3 rounded bg-zinc-900/90 border border-zinc-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <HugeiconsIcon icon={Globe02Icon} size={12} className="text-cyan-400" />
                  Social Card Preview (1.91:1 Aspect Ratio)
                </span>
                <div className="w-full aspect-[1200/630] rounded bg-zinc-950 border border-zinc-800 p-3 flex flex-col justify-between overflow-hidden shadow-inner">
                  <div className="flex justify-between items-center text-[9px] text-zinc-400 font-mono">
                    <span className="font-bold text-white">BUNKER VAULT</span>
                    <span className="text-emerald-400 uppercase">Secure Client Portal</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <h5 className="font-extrabold text-white text-[12px] truncate">Client Deliverables Review</h5>
                      <p className="text-[9.5px] text-zinc-400 line-clamp-2">
                        Zero-trust project access with milestones, timeline, and cryptographic verification.
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded bg-zinc-900 border border-zinc-800 shrink-0 flex items-center justify-center">
                      <AvatarPoster
                        config={generateAvatarConfig({
                          entityId: selectedProjectId !== 'all' ? selectedProjectId : 'default',
                          entityKind: 'project',
                          name: 'Client Project Deliverables',
                        })}
                        size="100%"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[8.5px] text-zinc-400 font-sans border-t border-zinc-850 pt-1">
                    <span>React • Supabase • TypeScript</span>
                    <span className="font-mono text-zinc-300">bunker.sh</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => setShowOgPreview(!showOgPreview)}
                className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <HugeiconsIcon icon={ViewIcon} size={14} className="text-cyan-400" />
                <span>{showOgPreview ? 'Hide Social Card' : 'Preview Social Card'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open(createdShareUrl, '_blank')}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <HugeiconsIcon icon={Link01Icon} size={14} />
                  <span>Open Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreatedShareUrl(null);
                    setShowOgPreview(false);
                  }}
                  className="px-4 py-1.5 rounded bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareLinksPanel;
