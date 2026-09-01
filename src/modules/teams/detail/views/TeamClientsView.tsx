import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserGroupIcon,
  PlusSignIcon,
  Search01Icon,
  Delete02Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import {
  useTeamClients,
  useAssignClientToTeam,
  useRemoveClientFromTeam,
} from '../../../../lib/supabase/queries/teams';
import { useClients } from '../../../../lib/supabase/queries/clients';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../../components/ui/select';
import type { Team } from '../../types/team.types';

interface TeamClientsViewProps {
  team: Team;
}

export const TeamClientsView: React.FC<TeamClientsViewProps> = ({ team }) => {
  const navigate = useNavigate();
  const { data: teamClients = [], isLoading } = useTeamClients(team.id);
  const { data: allClientsData } = useClients();
  const assignClientMutation = useAssignClientToTeam();
  const removeClientMutation = useRemoveClientFromTeam();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');

  const allClients: any[] = Array.isArray(allClientsData) ? allClientsData : (allClientsData?.clients || []);

  // Clients not currently assigned to this team
  const assignedClientIds = new Set(teamClients.map((tc) => tc.clientId));
  const availableClients = allClients.filter((c: any) => !assignedClientIds.has(c.id));

  const handleAssign = async () => {
    if (!selectedClientId) return;
    await assignClientMutation.mutateAsync({
      teamId: team.id,
      clientId: selectedClientId,
    });
    setIsAssignModalOpen(false);
    setSelectedClientId('');
  };

  const handleRemove = async (e: React.MouseEvent, clientId: string, clientName: string) => {
    e.stopPropagation();
    if (!window.confirm(`Unassign client "${clientName}" from this team?`)) return;
    await removeClientMutation.mutateAsync({
      teamId: team.id,
      clientId,
    });
  };

  const filteredClients = teamClients.filter((tc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tc.client?.name?.toLowerCase().includes(q) ||
      tc.client?.company?.toLowerCase().includes(q) ||
      tc.client?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team clients..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-black text-xs font-semibold rounded-sm transition-all shadow-lg shadow-cyan-500/20"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={16} />
          Assign Client
        </button>
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-zinc-900/40 border border-zinc-800/60 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-zinc-800 rounded-sm bg-zinc-950/40">
          <div className="w-12 h-12 rounded-sm bg-zinc-900 flex items-center justify-center text-zinc-500 mb-4">
            <HugeiconsIcon icon={UserGroupIcon} size={24} />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">No clients assigned</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-5">
            Assign clients to this team to associate deliverables, invoices, and projects under team scope.
          </p>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 rounded-sm transition-colors"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            Assign Client to Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((tc) => {
            const client = tc.client;
            if (!client) return null;

            return (
              <div
                key={tc.id}
                onClick={() => navigate(`/app/clients/${client.id}`)}
                className="group relative flex flex-col justify-between p-5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-sm cursor-pointer transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-sm bg-zinc-800 border border-zinc-700 flex items-center justify-center text-cyan-400 font-bold text-sm">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-200 group-hover:text-cyan-400 transition-colors">
                          {client.name}
                        </h3>
                        <div className="text-[10px] text-zinc-500">{client.company || 'Direct Client'}</div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleRemove(e, client.id, client.name)}
                      title="Unassign client"
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-sm transition-all"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={16} />
                    </button>
                  </div>

                  <div className="text-xs text-zinc-400 truncate">{client.email || '—'}</div>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                  <span className="capitalize">{tc.relationshipType} Scope</span>
                  <span className="text-cyan-400 flex items-center gap-1">
                    Open Client <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Client Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Assign Client to {team.name}</h3>
            <p className="text-xs text-zinc-400">
              Select an existing client to associate with this collaborative team.
            </p>

            {availableClients.length === 0 ? (
              <p className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-sm border border-amber-500/20">
                All existing clients are already associated with this team.
              </p>
            ) : (
              <Select value={selectedClientId} onValueChange={(val: any) => setSelectedClientId(val)}>
                <SelectTrigger size="sm" className="w-full bg-zinc-950 border-zinc-800 rounded-sm text-xs text-zinc-100">
                  <SelectValue>
                    {availableClients.find((c: any) => c.id === selectedClientId)
                      ? `${availableClients.find((c: any) => c.id === selectedClientId).name} ${
                          availableClients.find((c: any) => c.id === selectedClientId).company
                            ? `(${availableClients.find((c: any) => c.id === selectedClientId).company})`
                            : ''
                        }`
                      : 'Select a client...'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 rounded-sm text-zinc-200">
                  {availableClients.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedClientId || assignClientMutation.isPending}
                className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold rounded-sm disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
