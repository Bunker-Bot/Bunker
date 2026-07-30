import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link01Icon, Copy01Icon } from '@hugeicons/core-free-icons';
import { useClientShareLinks } from '../../../../lib/supabase/queries/clients';
import { ProjectEmptyState } from '../../../../components/project/ProjectEmptyState';
import { Badge } from '../../../../components/ui/badge';

interface ShareLinksTabProps {
  clientId: string;
}

export const ShareLinksTab: React.FC<ShareLinksTabProps> = ({ clientId }) => {
  const { data: shareLinks, isLoading } = useClientShareLinks(clientId, true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const links = shareLinks || [];

  const handleCopy = (token: string) => {
    const url = `${window.location.origin}/portal/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 font-mono text-xs select-none">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-sm bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : links.length === 0 ? (
        <ProjectEmptyState title="No Active Share Links" description="No client portal share links have been generated for these projects." icon={Link01Icon} />
      ) : (
        <div className="rounded-sm border border-zinc-800 bg-zinc-900/90 shadow-md overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-zinc-950/90 border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
              <tr>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Expiration</th>
                <th className="px-4 py-3">Generated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
              {links.map((sl: any) => (
                <tr key={sl.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3 font-bold text-white">{sl.projectName}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`rounded-sm text-[10px] font-bold uppercase ${sl.is_active ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-zinc-900 text-zinc-500 border-zinc-700'}`}>
                      {sl.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-bold text-cyan-400">{sl.view_count || 0} Views</td>
                  <td className="px-4 py-3 text-zinc-400 font-sans">{sl.expires_at ? new Date(sl.expires_at).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-3 text-zinc-400 text-[11px]">{new Date(sl.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleCopy(sl.token)}
                      className="inline-flex items-center gap-1 text-zinc-300 hover:text-white font-bold cursor-pointer"
                    >
                      <HugeiconsIcon icon={Copy01Icon} size={14} className={copiedToken === sl.token ? 'text-emerald-400' : ''} />
                      <span>{copiedToken === sl.token ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};
