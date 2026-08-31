import React, { useState } from 'react';
import { useGenerateShareLink } from '../../../lib/supabase/queries/share-links';
import { ShareService } from '../../../lib/services/share.service';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../../components/ui/sheet';
import { RadialSpinner } from '../../../components/ui/RadialSpinner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Link01Icon,
  LockKeyIcon,
  Calendar01Icon,
  EyeIcon,
  Copy01Icon,
  Tick01Icon,
  ViewIcon,
  ViewOffIcon,
  SparklesIcon,
  SecurityCheckIcon,
} from '@hugeicons/core-free-icons';

import { AvatarPoster } from '../../../features/identity-avatar';
import { generateAvatarConfig } from '../../../features/identity-avatar/lib/avatar-generator';

interface GenerateShareLinkDrawerProps {
  projectId: string;
  projectName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdUrl: string, plainPassword?: string) => void;
}

const MODULE_OPTIONS = [
  { key: 'overview', label: 'Project Overview', desc: 'Summary metrics & health' },
  { key: 'timeline', label: 'Timeline & Roadmap', desc: 'Project phases & schedule' },
  { key: 'milestones', label: 'Milestones', desc: 'Key deliverables & completion' },
  { key: 'screenshots', label: 'Screenshots & Demos', desc: 'Visual progress gallery' },
  { key: 'documents', label: 'Documentation', desc: 'Client-visible specs' },
  { key: 'files', label: 'Files & Assets', desc: 'Shared downloads & assets' },
  { key: 'deployments', label: 'Deployments', desc: 'Live build & staging links' },
  { key: 'github', label: 'GitHub Repositories', desc: 'Public repo sync' },
  { key: 'changelog', label: 'Release Changelog', desc: 'Version release notes' },
];

export const GenerateShareLinkDrawer: React.FC<GenerateShareLinkDrawerProps> = ({
  projectId,
  projectName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const generateMutation = useGenerateShareLink();

  const [linkName, setLinkName] = useState('Client Review Portal');
  const [expirationPreset, setExpirationPreset] = useState<'never' | '1h' | '24h' | '7d' | '30d' | '90d' | 'custom'>('7d');
  const [customExpiresAt, setCustomExpiresAt] = useState('');
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [maxViews, setMaxViews] = useState<string>('');
  const [notes, setNotes] = useState('');

  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    overview: true,
    timeline: true,
    milestones: true,
    screenshots: true,
    documents: true,
    files: true,
    deployments: true,
    github: true,
    changelog: true,
  });

  const [isCopiedPassword, setIsCopiedPassword] = useState(false);

  const handleGeneratePassword = () => {
    const pwd = ShareService.generateRandomPassword();
    setPassword(pwd);
    setEnablePassword(true);
  };

  const handleCopyGeneratedPassword = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setIsCopiedPassword(true);
    setTimeout(() => setIsCopiedPassword(false), 2000);
  };

  const calculateExpiresAt = (): string | null => {
    if (expirationPreset === 'never') return null;
    if (expirationPreset === 'custom') {
      return customExpiresAt ? new Date(customExpiresAt).toISOString() : null;
    }

    const now = new Date();
    switch (expirationPreset) {
      case '1h':
        now.setHours(now.getHours() + 1);
        break;
      case '24h':
        now.setHours(now.getHours() + 24);
        break;
      case '7d':
        now.setDate(now.getDate() + 7);
        break;
      case '30d':
        now.setDate(now.getDate() + 30);
        break;
      case '90d':
        now.setDate(now.getDate() + 90);
        break;
    }
    return now.toISOString();
  };

  const togglePermission = (key: string) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    const expiresAt = calculateExpiresAt();

    try {
      const result = await generateMutation.mutateAsync({
        payload: {
          projectId,
          name: linkName,
          expiresAt,
          maxViews: maxViews ? Number(maxViews) : null,
          permissions,
          notes,
        },
        plainPassword: enablePassword && password.trim() ? password.trim() : undefined,
      });

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const shareUrl = `${origin}/s/${result.link.token}`;

      onClose();
      if (onSuccess) {
        onSuccess(shareUrl, enablePassword ? password : undefined);
      }
    } catch (err) {
      console.error('Failed to generate share link:', err);
    }
  };

  const previewAvatarConfig = React.useMemo(() => {
    return generateAvatarConfig({
      entityId: projectId || 'drawer-preview',
      entityKind: 'project',
      name: projectName || linkName || 'Project Deliverables',
    });
  }, [projectId, projectName, linkName]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl bg-zinc-950 border-zinc-800 text-zinc-100 font-mono p-0 flex flex-col select-none overflow-hidden">
        <SheetHeader className="p-4 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
          <SheetTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <HugeiconsIcon icon={Link01Icon} size={16} className="text-cyan-400" />
            <span>Generate Cryptographic Share Link</span>
          </SheetTitle>
          <SheetDescription className="text-xs text-zinc-400">
            Create zero-trust, read-only project access links with client module isolation and optional password protection.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* Identity Preview Reassurance Banner */}
          <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800/80 flex items-center gap-3.5 shadow-sm">
            <div className="w-14 h-14 rounded-sm bg-zinc-950 border border-zinc-750 shrink-0 overflow-hidden flex items-center justify-center">
              <AvatarPoster config={previewAvatarConfig} size="100%" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Bunker Guardian Identity
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Dynamic OG Ready</span>
              </div>
              <p className="text-[11px] text-zinc-300 truncate font-bold">
                {linkName || 'Client Review Portal'}
              </p>
              <p className="text-[10px] text-zinc-400">
                A unique, deterministic 3D Guardian bust & social preview card will be generated.
              </p>
            </div>
          </div>
          {/* Link Title / Purpose */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
              Link Purpose / Client Identifier
            </label>
            <input
              type="text"
              required
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              placeholder="e.g. Acme Corp Q3 Deliverables Review"
              className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white font-mono text-xs outline-none focus:border-cyan-400"
            />
          </div>

          {/* Expiration Preset Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-amber-400" />
              <span>Link Expiration Policy</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: '90d', label: '90 Days' },
                { id: '24h', label: '24 Hours' },
                { id: '1h', label: '1 Hour' },
                { id: 'never', label: 'Never' },
                { id: 'custom', label: 'Custom' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setExpirationPreset(p.id as any)}
                  className={`py-1.5 px-2 rounded border text-center text-xs font-bold transition-colors cursor-pointer ${
                    expirationPreset === p.id
                      ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {expirationPreset === 'custom' && (
              <div className="pt-2">
                <input
                  type="datetime-local"
                  value={customExpiresAt}
                  onChange={(e) => setCustomExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white font-mono text-xs outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>

          {/* Password Protection */}
          <div className="p-3.5 rounded border border-zinc-800 bg-zinc-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={LockKeyIcon} size={16} className={enablePassword ? 'text-emerald-400' : 'text-zinc-500'} />
                <div>
                  <h4 className="font-bold text-white text-xs">Password Protection</h4>
                  <p className="text-[10.5px] text-zinc-400">Require bcrypt-hashed password verification before portal entry.</p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={enablePassword}
                onChange={(e) => setEnablePassword(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 accent-emerald-500 cursor-pointer"
              />
            </div>

            {enablePassword && (
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters..."
                      className="w-full px-3 py-2 pr-8 rounded bg-zinc-950 border border-zinc-800 text-white font-mono text-xs outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2.5 text-zinc-500 hover:text-white"
                    >
                      <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="px-2.5 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold cursor-pointer shrink-0 flex items-center gap-1"
                    title="Generate Secure Password"
                  >
                    <HugeiconsIcon icon={SparklesIcon} size={13} className="text-amber-400" />
                    <span>Auto</span>
                  </button>

                  {password && (
                    <button
                      type="button"
                      onClick={handleCopyGeneratedPassword}
                      className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                      title="Copy Password"
                    >
                      <HugeiconsIcon icon={isCopiedPassword ? Tick01Icon : Copy01Icon} size={14} className={isCopiedPassword ? 'text-emerald-400' : ''} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Max Views Limit */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <HugeiconsIcon icon={EyeIcon} size={13} className="text-sky-400" />
              <span>Maximum View Limit (Optional)</span>
            </label>
            <input
              type="number"
              min="1"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              placeholder="Leave blank for unlimited views..."
              className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white font-mono text-xs outline-none focus:border-sky-400"
            />
          </div>

          {/* Client Visible Modules Permissions Grid */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <HugeiconsIcon icon={SecurityCheckIcon} size={14} className="text-emerald-400" />
              <span>Client Portal Module Permissions</span>
            </label>

            <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 rounded bg-zinc-900/60 border border-zinc-800">
              {MODULE_OPTIONS.map((m) => {
                const isChecked = Boolean(permissions[m.key]);

                return (
                  <div
                    key={m.key}
                    onClick={() => togglePermission(m.key)}
                    className={`p-2 rounded border flex items-center justify-between cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-zinc-800/80 border-zinc-700 text-white'
                        : 'bg-zinc-950/60 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{m.label}</div>
                      <div className="text-[10px] text-zinc-400">{m.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-zinc-700 accent-cyan-400 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
              Internal Notes (Administrator Only)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes for why this link was generated..."
              className="w-full p-2.5 rounded bg-zinc-900 border border-zinc-800 text-white font-mono text-xs outline-none focus:border-zinc-700 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generateMutation.isPending}
              className="px-4 py-2 rounded bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              {generateMutation.isPending ? (
                <RadialSpinner size={14} />
              ) : (
                <HugeiconsIcon icon={Link01Icon} size={14} />
              )}
              <span>Generate Share Link</span>
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
