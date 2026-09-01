import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Clock01Icon,
  PlusSignIcon,
  Coins01Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { useTeamTime, useLogTime, useTeamProjects } from '../../../../lib/supabase/queries/teams';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../../components/ui/select';
import type { Team } from '../../types/team.types';

interface TeamTimeViewProps {
  team: Team;
}

export const TeamTimeView: React.FC<TeamTimeViewProps> = ({ team }) => {
  const { data: timeEntries = [], isLoading } = useTeamTime(team.id);
  const { data: teamProjects = [] } = useTeamProjects(team.id);
  const logTimeMutation = useLogTime();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('general');
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('0');
  const [note, setNote] = useState('');
  const [billable, setBillable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalMinutes = timeEntries.reduce((sum, t) => sum + t.durationMinutes, 0);
  const billableMinutes = timeEntries
    .filter((t) => t.billable)
    .reduce((sum, t) => sum + t.durationMinutes, 0);

  const handleLogTime = async (e: React.FormEvent) => {
    e.preventDefault();
    const duration = parseInt(hours || '0', 10) * 60 + parseInt(minutes || '0', 10);
    if (duration <= 0) {
      setError('Please enter a duration greater than 0 minutes');
      return;
    }

    setError(null);
    try {
      await logTimeMutation.mutateAsync({
        teamId: team.id,
        projectId: selectedProjectId !== 'general' ? selectedProjectId : undefined,
        durationMinutes: duration,
        note: note.trim() || undefined,
        billable,
      });

      setIsLogModalOpen(false);
      setHours('1');
      setMinutes('0');
      setNote('');
    } catch (err: any) {
      setError(err?.message || 'Failed to log time');
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-sm">
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
            <HugeiconsIcon icon={Clock01Icon} size={16} className="text-cyan-400" />
            <span>Total Tracked</span>
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </div>
        </div>

        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-sm">
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
            <HugeiconsIcon icon={Coins01Icon} size={16} className="text-emerald-400" />
            <span>Billable Ratio</span>
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 100}%
          </div>
        </div>

        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">Total Entries</div>
            <div className="text-xl font-bold text-zinc-200 mt-1">{timeEntries.length}</div>
          </div>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold rounded-sm transition-all shadow-lg shadow-cyan-500/20"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            Log Time
          </button>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-sm overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading time entries...</div>
        ) : timeEntries.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 space-y-2">
            <HugeiconsIcon icon={Clock01Icon} size={32} className="text-zinc-600 mx-auto" />
            <p>No time tracked for this team yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {timeEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm bg-zinc-800 border border-zinc-700 flex items-center justify-center text-cyan-400 font-bold text-xs">
                    {(entry.userName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-200">
                        {entry.userName || 'Teammate'}
                      </span>
                      {entry.projectName && (
                        <span className="px-2 py-0.5 text-[10px] bg-zinc-800 text-cyan-400 rounded-sm">
                          {entry.projectName}
                        </span>
                      )}
                    </div>
                    {entry.note && <div className="text-xs text-zinc-400 mt-0.5">{entry.note}</div>}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-zinc-400 font-bold">
                    {Math.floor(entry.durationMinutes / 60)}h {entry.durationMinutes % 60}m
                  </span>
                  {entry.billable ? (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-sm">
                      Billable
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-zinc-800 text-zinc-400 rounded-sm">
                      Non-billable
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-500">
                    {new Date(entry.startedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Time Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleLogTime}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-sm p-6 space-y-4 font-mono"
          >
            <h3 className="text-sm font-bold text-white">Log Time Entry</h3>

            {error && (
              <div className="p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                Project (Optional)
              </label>
              <Select value={selectedProjectId} onValueChange={(val: any) => setSelectedProjectId(val)}>
                <SelectTrigger size="sm" className="w-full bg-zinc-950 border-zinc-800 rounded-sm text-xs text-zinc-100">
                  <SelectValue>
                    {selectedProjectId === 'general'
                      ? 'General Team Work'
                      : teamProjects.find((p: any) => p.id === selectedProjectId)?.name || selectedProjectId}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 rounded-sm text-zinc-200">
                  <SelectItem value="general">General Team Work</SelectItem>
                  {teamProjects.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                  Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-sm text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                  Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-sm text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                Work Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What did you work on?"
                rows={2}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-sm text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="billable-check"
                checked={billable}
                onChange={(e) => setBillable(e.target.checked)}
                className="rounded-sm bg-zinc-950 border-zinc-800 text-cyan-400 focus:ring-0"
              />
              <label htmlFor="billable-check" className="text-xs text-zinc-300 cursor-pointer">
                Mark as billable time
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 rounded-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={logTimeMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold rounded-sm disabled:opacity-50"
              >
                {logTimeMutation.isPending ? (
                  <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
                ) : (
                  'Log Time'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
