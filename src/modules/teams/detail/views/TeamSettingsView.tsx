import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Settings01Icon,
  Delete02Icon,
  Archive02Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { useUpdateTeam, useArchiveTeam } from '../../../../lib/supabase/queries/teams';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../../components/ui/select';
import type { Team, TeamRole, TeamType } from '../../types/team.types';

interface TeamSettingsViewProps {
  team: Team;
  userRole: TeamRole;
}

const TEAM_TYPES: TeamType[] = [
  'Engineering',
  'Delivery',
  'Design',
  'Product',
  'Operations',
  'Cross-functional',
];

export const TeamSettingsView: React.FC<TeamSettingsViewProps> = ({ team }) => {
  const navigate = useNavigate();
  const updateTeamMutation = useUpdateTeam();
  const archiveTeamMutation = useArchiveTeam();

  const [name, setName] = useState(team.name);
  const [slug, setSlug] = useState(team.slug);
  const [description, setDescription] = useState(team.description || '');
  const [teamType, setTeamType] = useState<TeamType>((team.teamType as TeamType) || 'Engineering');
  const [currency, setCurrency] = useState(team.defaultCurrency || 'INR');
  const [timezone, setTimezone] = useState(team.timezone || 'UTC');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setMessage(null);
    try {
      await updateTeamMutation.mutateAsync({
        teamId: team.id,
        input: {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          teamType,
          defaultCurrency: currency,
          timezone,
        },
      });
      setMessage({ text: 'Team settings updated successfully', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err?.message || 'Failed to update team', type: 'error' });
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Archive this team workspace? You can restore it later.')) return;
    try {
      await archiveTeamMutation.mutateAsync(team.id);
      navigate('/app/teams');
    } catch (err: any) {
      setMessage({ text: err?.message || 'Failed to archive team', type: 'error' });
    }
  };

  return (
    <div className="space-y-8 font-mono max-w-3xl">
      {/* General Settings */}
      <form
        onSubmit={handleSaveGeneral}
        className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-sm space-y-5"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
          <HugeiconsIcon icon={Settings01Icon} size={16} className="text-cyan-400" />
          General Workspace Settings
        </div>

        {message && (
          <div
            className={`p-3 text-xs rounded-sm border ${
              message.type === 'success'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
              Team Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-sm text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
              Team Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-sm text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-sm text-xs text-zinc-100 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              Currency
            </label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-sm text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
              Timezone
            </label>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-sm text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={updateTeamMutation.isPending}
            className="flex items-center gap-2 px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold rounded-sm transition-all disabled:opacity-50"
          >
            {updateTeamMutation.isPending ? (
              <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
          <HugeiconsIcon icon={Delete02Icon} size={16} />
          Danger Zone
        </div>
        <p className="text-xs text-zinc-400">
          Archiving the team hides it from standard directories while preserving all project and client data.
        </p>

        <button
          type="button"
          onClick={handleArchive}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-sm transition-colors"
        >
          <HugeiconsIcon icon={Archive02Icon} size={16} />
          Archive Team Workspace
        </button>
      </div>
    </div>
  );
};
