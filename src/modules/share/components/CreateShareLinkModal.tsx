import React, { useState } from 'react';
import { ShareService } from '../../../lib/services/share.service';
import { RadialSpinner } from '../../../components/ui/RadialSpinner';
import { Select } from '../../../../packages/ui/src/components/select';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Link01Icon } from '@hugeicons/core-free-icons';

interface CreateShareLinkModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateShareLinkModal: React.FC<CreateShareLinkModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('Client Review');
  const [expirationOption, setExpirationOption] = useState('7d');
  const [password, setPassword] = useState('');
  const [maxViews, setMaxViews] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  const [permissions, setPermissions] = useState({
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

  if (!isOpen) return null;

  const calculateExpiresAt = (option: string): string | null => {
    const now = new Date();
    if (option === '1h') now.setHours(now.getHours() + 1);
    else if (option === '24h') now.setHours(now.getHours() + 24);
    else if (option === '7d') now.setDate(now.getDate() + 7);
    else if (option === '30d') now.setDate(now.getDate() + 30);
    else return null;
    return now.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await ShareService.createShareLink({
        projectId,
        name,
        expiresAt: calculateExpiresAt(expirationOption),
        passwordHash: password ? password : null,
        maxViews: maxViews !== '' ? Number(maxViews) : null,
        permissions,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create share link:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl p-6 rounded-sm bg-zinc-950 border border-zinc-800 shadow-2xl text-zinc-100 font-mono text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <HugeiconsIcon icon={Link01Icon} size={18} className="text-rose-500" />
            <span>Generate Enterprise Client Share Link</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold text-zinc-300">Link Purpose / Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Client Review, QA Build, Final Delivery"
              className="w-full px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-zinc-700"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-zinc-300">Expiration Policy</label>
              <Select
                value={expirationOption}
                onChange={(val) => setExpirationOption(val)}
                options={[
                  { value: 'never', label: 'Never Expires' },
                  { value: '1h', label: '1 Hour' },
                  { value: '24h', label: '24 Hours' },
                  { value: '7d', label: '7 Days' },
                  { value: '30d', label: '30 Days' },
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-zinc-300">Max Views (Optional)</label>
              <input
                type="number"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Unlimited"
                className="w-full px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-zinc-300">Password Protection (Optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave empty for no password"
              className="w-full px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-zinc-700"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-zinc-300">Allowed Sections (Permission Scope)</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(permissions).map((key) => (
                <label key={key} className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800/80 cursor-pointer capitalize text-[11px]">
                  <input
                    type="checkbox"
                    checked={(permissions as any)[key]}
                    onChange={(e) =>
                      setPermissions((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                    className="accent-rose-500 rounded"
                  />
                  <span>{key}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-sm bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all cursor-pointer"
            >
              {isLoading && <RadialSpinner size={12} />}
              <span>Generate Share Link</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShareLinkModal;
