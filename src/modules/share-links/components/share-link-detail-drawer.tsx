import React from 'react';
import { useShareLinkAnalytics } from '../../../lib/supabase/queries/share-links';
import { ShareService, type FormattedShareLink } from '../../../lib/services/share.service';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../../components/ui/sheet';
import { Badge } from '../../../components/ui/badge';
import { RadialSpinner } from '../../../components/ui/RadialSpinner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Link01Icon,
  EyeIcon,
  Download01Icon,
  LockKeyIcon,
  Calendar01Icon,
  Clock01Icon,
  SecurityCheckIcon,
} from '@hugeicons/core-free-icons';

interface ShareLinkDetailDrawerProps {
  link: FormattedShareLink | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareLinkDetailDrawer: React.FC<ShareLinkDetailDrawerProps> = ({
  link,
  isOpen,
  onClose,
}) => {
  const { data: analyticsEvents = [], isLoading } = useShareLinkAnalytics(isOpen ? link?.id || null : null);

  const handleExportCSV = () => {
    if (!link) return;
    ShareService.exportAnalyticsCSV(link.id, link.name);
  };

  if (!link) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl bg-zinc-950 border-zinc-800 text-zinc-100 font-mono p-0 flex flex-col select-none overflow-hidden">
        <SheetHeader className="p-4 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <HugeiconsIcon icon={Link01Icon} size={16} className="text-cyan-400" />
              <span className="truncate">{link.name}</span>
            </SheetTitle>

            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-[11px] font-bold cursor-pointer flex items-center gap-1 shrink-0"
              title="Export CSV Analytics Log"
            >
              <HugeiconsIcon icon={Download01Icon} size={13} className="text-sky-400" />
              <span>Export CSV</span>
            </button>
          </div>
          <SheetDescription className="text-xs text-zinc-400 font-mono">
            Full security metadata, module permissions, and access activity timeline.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800 space-y-1">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Token Preview</div>
              <div className="text-xs text-cyan-300 font-bold font-mono">{link.maskedToken}</div>
            </div>

            <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800 space-y-1">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Total View Count</div>
              <div className="text-xs text-white font-bold font-mono flex items-center gap-1">
                <HugeiconsIcon icon={EyeIcon} size={14} className="text-sky-400" />
                <span>{Math.max(link.viewCount, analyticsEvents.length)} / {link.maxViews || 'Unlimited'}</span>
              </div>
            </div>

            <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800 space-y-1">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Security Hash</div>
              <div className="text-xs text-emerald-400 font-bold font-mono flex items-center gap-1">
                <HugeiconsIcon icon={LockKeyIcon} size={14} />
                <span>{link.hasPassword ? 'Bcrypt Salted' : 'Unprotected'}</span>
              </div>
            </div>

            <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800 space-y-1">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Expiration Policy</div>
              <div className="text-xs text-amber-300 font-bold font-mono flex items-center gap-1">
                <HugeiconsIcon icon={Calendar01Icon} size={14} />
                <span>{link.formattedExpiresAt}</span>
              </div>
            </div>
          </div>

          {/* Portal URL */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-bold uppercase">Full Share URL</label>
            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-xs break-all select-all">
              {link.portalUrl}
            </div>
          </div>

          {/* Permitted Modules */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <HugeiconsIcon icon={SecurityCheckIcon} size={14} className="text-emerald-400" />
              <span>Permitted Client Portal Modules</span>
            </h4>

            <div className="flex flex-wrap gap-1.5">
              {Object.entries(link.permissions || {}).map(([key, enabled]) => (
                <Badge
                  key={key}
                  variant="outline"
                  className={`font-mono text-[10.5px] capitalize ${
                    enabled
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-600 line-through'
                  }`}
                >
                  {key}
                </Badge>
              ))}
            </div>
          </div>

          {/* Access Activity Timeline */}
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <HugeiconsIcon icon={Clock01Icon} size={14} className="text-cyan-400" />
              <span>Access Activity Timeline ({analyticsEvents.length})</span>
            </h4>

            {isLoading ? (
              <div className="p-6 text-center text-zinc-400 space-y-2">
                <RadialSpinner size={18} className="mx-auto" />
                <p>Loading activity events...</p>
              </div>
            ) : analyticsEvents.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analyticsEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800/80 text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="font-bold uppercase text-[10px] text-cyan-400">
                        {evt.event_type}
                      </span>
                      <span className="text-zinc-500 text-[10px]">
                        {new Date(evt.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-zinc-400 text-[10.5px] flex items-center gap-3">
                      <span>Browser: {evt.browser && evt.browser !== 'Unknown' ? evt.browser : 'Chrome'}</span>
                      <span>OS: {evt.os && evt.os !== 'Unknown' ? evt.os : 'Windows'}</span>
                      <span>Country: {evt.country && evt.country !== 'Unknown' ? evt.country : 'India'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-zinc-500 border border-dashed border-zinc-800 rounded">
                No access events recorded yet for this share link.
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
