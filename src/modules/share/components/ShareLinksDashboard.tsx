import React, { useState, useEffect } from 'react';
import { ShareService, type FormattedShareLink } from '../../../lib/services/share.service';
import { CreateShareLinkModal } from './CreateShareLinkModal';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link01Icon, Copy01Icon, Tick02Icon, Download01Icon, LockKeyIcon, AlertCircleIcon, Cancel01Icon } from '@hugeicons/core-free-icons';

interface ShareLinksDashboardProps {
  projectId: string;
}

export const ShareLinksDashboard: React.FC<ShareLinksDashboardProps> = ({ projectId }) => {
  const [links, setLinks] = useState<FormattedShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const data = await ShareService.getShareLinks(projectId);
      setLinks(data);
    } catch (err) {
      console.error('Failed to fetch share links:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [projectId]);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggle = async (id: string, currentStatus: any) => {
    await ShareService.toggleStatus(id, currentStatus);
    fetchLinks();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this share link? Access will be immediately revoked.')) {
      await ShareService.deleteShareLink(id);
      fetchLinks();
    }
  };

  const handleExportCSV = (id: string, name: string) => {
    ShareService.exportAnalyticsCSV(id, name);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[10px] font-mono font-semibold uppercase">Active</span>;
      case 'expired':
        return <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-400 text-[10px] font-mono font-semibold uppercase">Expired</span>;
      case 'disabled':
        return <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono font-semibold uppercase">Disabled</span>;
      case 'view_limit_reached':
        return <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-400 text-[10px] font-mono font-semibold uppercase">View Limit</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono font-semibold uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between p-4 rounded-sm bg-zinc-950 border border-zinc-800/80 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-sm bg-rose-950/40 border border-rose-800/60 text-rose-400">
            <HugeiconsIcon icon={Link01Icon} size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Client Share Portal Links</h3>
            <p className="text-zinc-400 text-[11px]">Generate & manage zero-trust read-only access links for clients.</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-sm bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all cursor-pointer"
        >
          <HugeiconsIcon icon={Link01Icon} size={14} />
          <span>New Share Link</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-zinc-500 font-mono text-xs animate-pulse">
          Loading share link records...
        </div>
      ) : links.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-sm">
          No share links created yet for this project.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-zinc-800/80 bg-zinc-950/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-zinc-900/90 border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
              <tr>
                <th className="px-4 py-3">Link Purpose</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Views / Max</th>
                <th className="px-4 py-3">Password</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">
                    <div>{link.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[200px]">
                      /s/{link.token.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(link.status)}</td>
                  <td className="px-4 py-3">
                    {link.viewCount} / {link.maxViews || '∞'}
                  </td>
                  <td className="px-4 py-3">
                    {link.hasPassword ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <HugeiconsIcon icon={LockKeyIcon} size={12} /> Yes
                      </span>
                    ) : (
                      <span className="text-zinc-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{link.formattedExpiresAt}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleCopy(link.id, link.portalUrl)}
                      className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center"
                      title="Copy Portal Link"
                    >
                      <HugeiconsIcon icon={copiedId === link.id ? Tick02Icon : Copy01Icon} size={13} className={copiedId === link.id ? 'text-emerald-400' : 'text-zinc-400'} />
                    </button>

                    <button
                      onClick={() => handleToggle(link.id, link.status)}
                      className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center"
                      title={link.status === 'active' ? 'Disable Link' : 'Enable Link'}
                    >
                      <HugeiconsIcon icon={AlertCircleIcon} size={13} className="text-amber-400" />
                    </button>

                    <button
                      onClick={() => handleExportCSV(link.id, link.name)}
                      className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center"
                      title="Export CSV Analytics"
                    >
                      <HugeiconsIcon icon={Download01Icon} size={13} className="text-sky-400" />
                    </button>

                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:text-rose-400 transition-colors cursor-pointer inline-flex items-center justify-center"
                      title="Delete / Revoke Share Link"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={13} className="text-rose-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateShareLinkModal
        projectId={projectId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchLinks}
      />
    </div>
  );
};

export default ShareLinksDashboard;
