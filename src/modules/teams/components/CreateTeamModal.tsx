import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  UserGroupIcon,
  Shield02Icon,
  SparklesIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { useCreateTeam } from '../../../lib/supabase/queries/teams';
import { generateAvatarConfig } from '../../../features/identity-avatar/lib/avatar-generator';
import { IdentityAvatarCanvas } from '../../../features/identity-avatar/components/IdentityAvatarCanvas';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../components/ui/select';
import type { TeamType } from '../types/team.types';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (teamId: string) => void;
}

const TEAM_TYPES: TeamType[] = [
  'Engineering',
  'Delivery',
  'Design',
  'Product',
  'Operations',
  'Cross-functional',
];

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'SGD', 'AED'];

const COLOR_PRESETS = [
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#E11D48', // Rose
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#71717A', // Slate
];

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const createTeamMutation = useCreateTeam();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teamType, setTeamType] = useState<TeamType>('Engineering');
  const [currency, setCurrency] = useState('INR');
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const [primaryColor, setPrimaryColor] = useState('#06B6D4');
  const [error, setError] = useState<string | null>(null);

  // Auto-generate preview avatar config deterministically
  const previewAvatarConfig = useMemo(() => {
    return generateAvatarConfig({
      entityId: name || 'bunker-team',
      entityKind: 'team',
      name: name || 'Bunker Team',
      preferredColor: primaryColor,
    });
  }, [name, primaryColor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Team name is required');
      return;
    }

    setError(null);
    try {
      const created = await createTeamMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        teamType,
        defaultCurrency: currency,
        timezone,
        primaryColor,
      });

      onClose();
      if (onSuccess) onSuccess(created.id);
    } catch (err: any) {
      setError(err?.message || 'Failed to create team');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-sm shadow-2xl overflow-hidden font-mono"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80 bg-zinc-950/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <HugeiconsIcon icon={UserGroupIcon} size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-100">Create Collaborative Team</h2>
                <p className="text-xs text-zinc-400">Establish a new operational workspace & Team Guardian</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-sm transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Form inputs */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Platform Engineering"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-sm text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the team's operational scope..."
                    rows={2}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-sm text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                      Team Type
                    </label>
                    <Select value={teamType} onValueChange={(val: any) => setTeamType(val)}>
                      <SelectTrigger size="sm" className="w-full bg-zinc-950 border-zinc-800 rounded-sm text-xs text-zinc-100">
                        <SelectValue>{teamType}</SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-zinc-800 rounded-sm text-zinc-200">
                        {TEAM_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                      Default Currency
                    </label>
                    <Select value={currency} onValueChange={(val: any) => setCurrency(val)}>
                      <SelectTrigger size="sm" className="w-full bg-zinc-950 border-zinc-800 rounded-sm text-xs text-zinc-100">
                        <SelectValue>{currency}</SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-zinc-800 rounded-sm text-zinc-200">
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                    Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setPrimaryColor(color)}
                        className={`w-7 h-7 rounded-sm transition-transform ${
                          primaryColor === color
                            ? 'ring-2 ring-white scale-110'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Instant Team Guardian Preview */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-sm text-center">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-zinc-400 mb-2 font-medium">
                  <HugeiconsIcon icon={Shield02Icon} size={14} className="text-cyan-400" />
                  Team Guardian
                </div>
                <div className="w-36 h-36 relative mb-3">
                  <IdentityAvatarCanvas
                    config={previewAvatarConfig}
                  />
                </div>
                <div className="text-xs font-semibold text-zinc-200">
                  {name.trim() || 'Team Guardian'}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  Generated with Team Identity
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createTeamMutation.isPending}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] rounded-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {createTeamMutation.isPending ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
                    Creating Team...
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={SparklesIcon} size={16} />
                    Create Team Workspace
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
