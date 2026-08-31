import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import {
  useDeployments,
  useUpsertDeployment,
  useDeleteDeployment,
} from '../../lib/supabase/queries/changelog-notes-deployments';
import { useProjects } from '../projects/hooks/useProjects';
import type {
  DeploymentEntry,
  DeploymentEnvironment,
  DeploymentStatus,
} from './types/deployments';
import { PageHeader } from '../../components/project/PageHeader';
import { ConfirmDeleteDialog } from '../../components/ui/confirm-delete-dialog';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Folder01Icon,
  Link01Icon,
  Copy01Icon,
  Delete02Icon,
  Edit01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  GlobalIcon,
  CodeIcon,
  ComputerIcon,
  EyeIcon,
  Alert02Icon,
  MultiplicationSignCircleIcon,
  Clock01Icon,
  Menu01Icon,
  Grid02Icon,
} from '@hugeicons/core-free-icons';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../components/ui/select';

interface DeploymentsTabProps {
  projectId?: string;
  readOnly?: boolean;
}

const ENVIRONMENTS: { id: DeploymentEnvironment; label: string; icon: any; badgeColor: string }[] = [
  { id: 'production', label: 'Production', icon: GlobalIcon, badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { id: 'staging', label: 'Staging', icon: ComputerIcon, badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  { id: 'development', label: 'Development', icon: CodeIcon, badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { id: 'local', label: 'Local Host', icon: ComputerIcon, badgeColor: 'text-zinc-400 border-zinc-700 bg-zinc-800/50' },
];

const STATUS_CONFIG: Record<DeploymentStatus, { label: string; color: string; icon: any }> = {
  active: { label: 'Online', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckmarkCircle02Icon },
  successful: { label: 'Online', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckmarkCircle02Icon },
  deploying: { label: 'Pending', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock01Icon },
  failed: { label: 'Failed', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', icon: MultiplicationSignCircleIcon },
  rolled_back: { label: 'Offline', color: 'text-zinc-400 bg-zinc-800 border-zinc-700', icon: Alert02Icon },
};

export const DeploymentsTab: React.FC<DeploymentsTabProps> = ({
  projectId: propProjectId,
  readOnly = false,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(propProjectId || 'all');
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentEntry | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDeployment, setEditingDeployment] = useState<DeploymentEntry | null>(null);
  const [deploymentToDelete, setDeploymentToDelete] = useState<DeploymentEntry | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Form State
  const [env, setEnv] = useState<DeploymentEnvironment>('production');
  const [version, setVersion] = useState('v1.0.0');
  const [frontendUrl, setFrontendUrl] = useState('');
  const [backendUrl, setBackendUrl] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [adminUrl, setAdminUrl] = useState('');
  const [portalUrl, setPortalUrl] = useState('');
  const [notes, setNotes] = useState('');

  const activeProjectId = propProjectId || (selectedProjectId === 'all' ? undefined : selectedProjectId);

  const { data: projectsResult } = useProjects();
  const { data: deployments = [], isLoading } = useDeployments(activeProjectId);

  const upsertMutation = useUpsertDeployment();
  const deleteMutation = useDeleteDeployment();

  const projectsOptions = useMemo(() => {
    const rawProjects =
      (projectsResult as any)?.projects ||
      (projectsResult as any)?.data ||
      (Array.isArray(projectsResult) ? projectsResult : []);

    return rawProjects.map((p: any) => ({
      id: String(p.id),
      name: p.name || p.title || 'Untitled Project',
    }));
  }, [projectsResult]);

  const selectedProjectName = useMemo(() => {
    if (selectedProjectId === 'all') return 'All Projects';
    const found = projectsOptions.find((p: any) => p.id === selectedProjectId);
    if (found) return found.name;
    return 'Select Project';
  }, [selectedProjectId, projectsOptions]);

  const stats = useMemo(() => {
    const total = deployments.length;
    const prod = deployments.filter((d) => d.environment === 'production').length;
    const staging = deployments.filter((d) => d.environment === 'staging').length;
    const activeEnvs = new Set(deployments.map((d) => d.environment)).size;
    return { total, prod, staging, activeEnvs };
  }, [deployments]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) return;

    const payload = {
      id: editingDeployment?.id,
      projectId: activeProjectId,
      environment: env,
      version: version.trim() || 'v1.0.0',
      frontendUrl: frontendUrl.trim() || undefined,
      backendUrl: backendUrl.trim() || undefined,
      apiUrl: apiUrl.trim() || undefined,
      adminUrl: adminUrl.trim() || undefined,
      portalUrl: portalUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      status: 'successful' as DeploymentStatus,
    };

    await upsertMutation.mutateAsync(payload);
    setIsFormModalOpen(false);
  };

  const openEditModal = (dep: DeploymentEntry) => {
    setEditingDeployment(dep);
    setEnv(dep.environment);
    setVersion(dep.version);
    setFrontendUrl(dep.frontendUrl || '');
    setBackendUrl(dep.backendUrl || '');
    setApiUrl(dep.apiUrl || '');
    setAdminUrl(dep.adminUrl || '');
    setPortalUrl(dep.portalUrl || '');
    setNotes(dep.notes || '');
    setIsFormModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="w-full max-w-[1700px] mx-auto space-y-6 font-sans text-zinc-100 select-none pb-12"
    >
      {/* Shared Platform PageHeader Component */}
      <PageHeader
        title="Deployments & Status"
        description="Centralized environment matrix, service health monitoring, and release history"
        icon={GlobalIcon}
        actions={
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap shrink-0">
            {!readOnly && !propProjectId && (
              <Select value={selectedProjectId} onValueChange={(val) => setSelectedProjectId(val as string)}>
                <SelectTrigger className="h-8 text-[11px] px-2.5 bg-zinc-900 border-zinc-800 font-mono text-zinc-200 hover:text-white flex items-center gap-1.5 rounded-sm shrink-0 w-36 sm:w-48">
                  <HugeiconsIcon icon={Folder01Icon} size={13} className="text-zinc-400 shrink-0" />
                  <span className="truncate max-w-[110px] sm:max-w-[170px]">{selectedProjectName}</span>
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-xs font-mono">
                  <SelectItem value="all">All Projects</SelectItem>
                  {projectsOptions.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {!readOnly && (
              <button
                type="button"
                onClick={() => {
                  setEditingDeployment(null);
                  setFrontendUrl('');
                  setBackendUrl('');
                  setApiUrl('');
                  setAdminUrl('');
                  setPortalUrl('');
                  setNotes('');
                  setIsFormModalOpen(true);
                }}
                className="h-8 px-2.5 sm:px-3 rounded-sm bg-white text-black font-semibold text-xs font-mono inline-flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-colors cursor-pointer shadow-md shrink-0"
                title="Register Deployment"
              >
                <HugeiconsIcon icon={Add01Icon} size={14} />
                <span className="hidden sm:inline">Register Deployment</span>
              </button>
            )}
          </div>
        }
      />

      {/* Deployment Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 rounded-sm bg-[#0c0c0d] border border-zinc-800/60 space-y-1">
          <div className="text-zinc-400 text-[11px]">Total Deployments</div>
          <div className="text-xl font-bold text-white tracking-tight">{stats.total}</div>
          <div className="text-[10px] text-zinc-500">Registered environments</div>
        </div>

        <div className="p-3.5 rounded-sm bg-[#0c0c0d] border border-zinc-800/60 space-y-1">
          <div className="text-zinc-400 text-[11px]">Production Live</div>
          <div className="text-xl font-bold text-emerald-400 tracking-tight">{stats.prod}</div>
          <div className="text-[10px] text-emerald-500/70 font-semibold">Active live endpoints</div>
        </div>

        <div className="p-3.5 rounded-sm bg-[#0c0c0d] border border-zinc-800/60 space-y-1">
          <div className="text-zinc-400 text-[11px]">Staging Builds</div>
          <div className="text-xl font-bold text-purple-400 tracking-tight">{stats.staging}</div>
          <div className="text-[10px] text-purple-500/70">Pre-release verification</div>
        </div>

        <div className="p-3.5 rounded-sm bg-[#0c0c0d] border border-zinc-800/60 space-y-1">
          <div className="text-zinc-400 text-[11px]">Active Envs</div>
          <div className="text-xl font-bold text-zinc-200 tracking-tight">{stats.activeEnvs} / 4</div>
          <div className="text-[10px] text-zinc-500">Prod, Staging, Dev, Local</div>
        </div>
      </div>

      {/* Environment Table / Cards Section */}
      <div className="space-y-3 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <HugeiconsIcon icon={ComputerIcon} size={15} className="text-zinc-400" />
            <span>Active Deployment Environments ({deployments.length})</span>
          </div>

          {/* View Toggle */}
          <div className="inline-flex items-center p-0.5 rounded-sm bg-zinc-900/90 border border-zinc-800/80 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-mono transition-colors cursor-pointer ${viewMode === 'table'
                ? 'bg-zinc-800 text-white font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              <HugeiconsIcon icon={Menu01Icon} size={13} />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-mono transition-colors cursor-pointer ${viewMode === 'cards'
                ? 'bg-zinc-800 text-white font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              <HugeiconsIcon icon={Grid02Icon} size={13} />
              <span>Cards</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-sm bg-[#0c0c0d] border border-zinc-800/40 animate-pulse" />
            ))}
          </div>
        ) : deployments.length === 0 ? (
          <div className="p-12 rounded-sm bg-[#0c0c0d] border border-zinc-800/60 text-center font-mono space-y-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <HugeiconsIcon icon={ComputerIcon} size={20} />
            </div>
            <h4 className="text-sm font-semibold text-zinc-300 font-sans">No deployments have been recorded yet.</h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              {readOnly
                ? 'No live environment endpoints have been shared for this project.'
                : 'Click "Register Deployment" above to log production, staging, development, or local environment URLs.'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="overflow-x-auto rounded-sm border border-zinc-800/80 bg-[#0c0c0d] shadow-sm">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/60 text-zinc-400 text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Environment</th>
                  <th className="py-3 px-4 font-semibold">Version</th>
                  <th className="py-3 px-4 font-semibold">Frontend App</th>
                  <th className="py-3 px-4 font-semibold">Backend API</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Last Deployment</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {deployments.map((dep) => {
                  const envConfig = ENVIRONMENTS.find((e) => e.id === dep.environment) || ENVIRONMENTS[0];
                  const statusInfo = STATUS_CONFIG[dep.status] || STATUS_CONFIG.successful;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr
                      key={dep.id}
                      onClick={() => setSelectedDeployment(dep)}
                      className="hover:bg-zinc-900/50 transition-colors cursor-pointer group"
                    >
                      {/* Environment Badge */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider border inline-flex items-center gap-1.5 ${envConfig.badgeColor}`}>
                          <HugeiconsIcon icon={envConfig.icon} size={12} />
                          {envConfig.label}
                        </span>
                      </td>

                      {/* Version */}
                      <td className="py-3 px-4 text-zinc-200 font-mono font-bold">
                        {dep.version}
                      </td>

                      {/* Frontend URL */}
                      <td className="py-3 px-4">
                        {dep.frontendUrl ? (
                          <UrlCell url={dep.frontendUrl} onCopy={handleCopy} copied={copiedUrl === dep.frontendUrl} />
                        ) : (
                          <span className="text-zinc-600 font-mono text-[10px]">Unset</span>
                        )}
                      </td>

                      {/* Backend URL */}
                      <td className="py-3 px-4">
                        {dep.backendUrl ? (
                          <UrlCell url={dep.backendUrl} onCopy={handleCopy} copied={copiedUrl === dep.backendUrl} />
                        ) : (
                          <span className="text-zinc-600 font-mono text-[10px]">Unset</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border inline-flex items-center gap-1 ${statusInfo.color}`}>
                          <HugeiconsIcon icon={StatusIcon} size={11} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Last Deployment Time */}
                      <td className="py-3 px-4 text-zinc-400 text-[11px] whitespace-nowrap">
                        {formatDistanceToNow(new Date(dep.deployedAt), { addSuffix: true })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedDeployment(dep)}
                            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="View Environment Details"
                          >
                            <HugeiconsIcon icon={EyeIcon} size={13} />
                          </button>
                          {!readOnly && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditModal(dep)}
                                className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                title="Edit Deployment"
                              >
                                <HugeiconsIcon icon={Edit01Icon} size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeploymentToDelete(dep)}
                                className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Delete Deployment"
                              >
                                <HugeiconsIcon icon={Delete02Icon} size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {deployments.map((dep) => {
              const envConfig = ENVIRONMENTS.find((e) => e.id === dep.environment) || ENVIRONMENTS[0];
              const statusInfo = STATUS_CONFIG[dep.status] || STATUS_CONFIG.successful;
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={dep.id}
                  onClick={() => setSelectedDeployment(dep)}
                  className="p-4 rounded-sm bg-[#0c0c0d] border border-zinc-800/80 hover:border-zinc-700/90 transition-all shadow-sm space-y-3 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider border inline-flex items-center gap-1.5 ${envConfig.badgeColor}`}>
                        <HugeiconsIcon icon={envConfig.icon} size={12} />
                        {envConfig.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold border inline-flex items-center gap-1 ${statusInfo.color}`}>
                        <HugeiconsIcon icon={StatusIcon} size={11} />
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Version & Time */}
                    <div className="flex items-baseline justify-between gap-2 border-b border-zinc-800/60 pb-2">
                      <div>
                        <div className="text-[10px] text-zinc-500 font-mono">VERSION</div>
                        <div className="text-sm font-bold text-white font-mono">{dep.version}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-zinc-500 font-mono">DEPLOYED</div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {formatDistanceToNow(new Date(dep.deployedAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>

                    {/* URLs */}
                    <div className="space-y-1.5 font-mono text-[11px]">
                      {dep.frontendUrl ? (
                        <div className="flex items-center justify-between gap-2 p-2 rounded-sm bg-zinc-900/60 border border-zinc-800/60">
                          <span className="text-[10px] text-zinc-500 uppercase">App</span>
                          <UrlCell url={dep.frontendUrl} onCopy={handleCopy} copied={copiedUrl === dep.frontendUrl} />
                        </div>
                      ) : null}
                      {dep.backendUrl ? (
                        <div className="flex items-center justify-between gap-2 p-2 rounded-sm bg-zinc-900/60 border border-zinc-800/60">
                          <span className="text-[10px] text-zinc-500 uppercase">API</span>
                          <UrlCell url={dep.backendUrl} onCopy={handleCopy} copied={copiedUrl === dep.backendUrl} />
                        </div>
                      ) : null}
                      {!dep.frontendUrl && !dep.backendUrl && (
                        <div className="p-2 rounded-sm bg-zinc-900/40 border border-zinc-800/40 text-[11px] text-zinc-500 text-center">
                          No direct endpoint URLs configured
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-500 font-mono">
                    <span>{format(new Date(dep.deployedAt), 'MMM d, yyyy HH:mm')}</span>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedDeployment(dep)}
                        className="p-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <HugeiconsIcon icon={EyeIcon} size={13} />
                      </button>
                      {!readOnly && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditModal(dep)}
                            className="p-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Edit Deployment"
                          >
                            <HugeiconsIcon icon={Edit01Icon} size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeploymentToDelete(dep)}
                            className="p-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Deployment"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deployment History Timeline */}
      {deployments.length > 0 && (
        <div className="space-y-4 font-mono pt-6 border-t border-zinc-800/80">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              <HugeiconsIcon icon={Clock01Icon} size={15} className="text-zinc-400" />
              <span>Deployment Timeline</span>
            </div>
            <div className="text-[11px] text-zinc-500">
              {deployments.length} total deployment events logged
            </div>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500/50 before:via-zinc-800 before:to-zinc-900">
            {deployments.map((dep) => {
              const envConfig = ENVIRONMENTS.find((e) => e.id === dep.environment) || ENVIRONMENTS[0];
              const statusInfo = STATUS_CONFIG[dep.status] || STATUS_CONFIG.successful;

              return (
                <div key={dep.id} className="relative group">
                  {/* Horizontal Colored Connector Line */}
                  <div className="absolute -left-3 sm:-left-[18px] top-[28px] -translate-y-1/2 w-3 sm:w-[18px] h-0.5 bg-gradient-to-r from-emerald-500/90 via-emerald-500/40 to-transparent z-0" />

                  {/* Glowing Node Icon */}
                  <div className={`absolute -left-3 sm:-left-[18px] top-[28px] -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#0c0c0d] border ${dep.environment === 'production' ? 'border-emerald-400 shadow-emerald-500/30 text-emerald-400' : dep.environment === 'staging' ? 'border-amber-500/80 shadow-amber-500/20 text-amber-400' : 'border-purple-500/80 shadow-purple-500/20 text-purple-400'
                    } flex items-center justify-center shadow-md z-10 transition-transform group-hover:scale-110`}>
                    <HugeiconsIcon icon={envConfig.icon} size={10} />
                  </div>

                  {/* Responsive Timeline Card */}
                  <div className="p-4 rounded-sm bg-[#0c0c0d] border border-zinc-800/70 hover:border-zinc-700/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${envConfig.badgeColor}`}>
                          <HugeiconsIcon icon={envConfig.icon} size={11} />
                          {envConfig.label}
                        </span>

                        <span className="font-bold text-white text-xs font-mono bg-zinc-900 px-2 py-0.5 rounded-sm border border-zinc-800">
                          {dep.version}
                        </span>

                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold border inline-flex items-center gap-1 ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {dep.notes && (
                        <p className="text-xs text-zinc-300 font-sans leading-relaxed line-clamp-2 bg-zinc-900/40 p-2 rounded-sm border border-zinc-800/40">
                          "{dep.notes}"
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-zinc-500 flex-wrap">
                        {dep.frontendUrl && (
                          <a
                            href={dep.frontendUrl.startsWith('http') ? dep.frontendUrl : `https://${dep.frontendUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <HugeiconsIcon icon={Link01Icon} size={12} />
                            <span>Frontend Live</span>
                          </a>
                        )}
                        {dep.backendUrl && (
                          <a
                            href={dep.backendUrl.startsWith('http') ? dep.backendUrl : `https://${dep.backendUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-purple-400 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <HugeiconsIcon icon={CodeIcon} size={12} />
                            <span>Backend Live</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/50">
                      <div className="text-[11px] text-zinc-400 font-mono text-left sm:text-right">
                        {format(new Date(dep.deployedAt), 'MMM d, yyyy HH:mm')}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono text-left sm:text-right">
                        ({formatDistanceToNow(new Date(dep.deployedAt), { addSuffix: true })})
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDeployment(dep)}
                        className="mt-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[11px] font-mono inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <HugeiconsIcon icon={EyeIcon} size={12} />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Environment Details Drawer (Framer Motion Drawer) */}
      <AnimatePresence>
        {selectedDeployment && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-end select-none font-sans">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-xl h-full bg-[#0c0c0e]/98 border-l border-zinc-800/90 p-6 font-mono text-xs space-y-6 shadow-2xl overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <HugeiconsIcon icon={ComputerIcon} size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-sans tracking-tight uppercase">
                        {selectedDeployment.environment} Deployment
                      </h3>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        Version {selectedDeployment.version} • {format(new Date(selectedDeployment.deployedAt), 'MMMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDeployment(null)}
                    className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={16} />
                  </button>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-4">
                  <div className="p-4 rounded-sm bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                    <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Registered Endpoint URLs</h4>
                    <div className="space-y-2">
                      {selectedDeployment.frontendUrl && (
                        <DrawerUrlRow label="Frontend Application" url={selectedDeployment.frontendUrl} onCopy={handleCopy} copied={copiedUrl === selectedDeployment.frontendUrl} />
                      )}
                      {selectedDeployment.backendUrl && (
                        <DrawerUrlRow label="Backend API" url={selectedDeployment.backendUrl} onCopy={handleCopy} copied={copiedUrl === selectedDeployment.backendUrl} />
                      )}
                      {selectedDeployment.apiUrl && (
                        <DrawerUrlRow label="OpenAPI / Docs" url={selectedDeployment.apiUrl} onCopy={handleCopy} copied={copiedUrl === selectedDeployment.apiUrl} />
                      )}
                      {selectedDeployment.adminUrl && (
                        <DrawerUrlRow label="Admin Console" url={selectedDeployment.adminUrl} onCopy={handleCopy} copied={copiedUrl === selectedDeployment.adminUrl} />
                      )}
                      {selectedDeployment.portalUrl && (
                        <DrawerUrlRow label="Client Share Portal" url={selectedDeployment.portalUrl} onCopy={handleCopy} copied={copiedUrl === selectedDeployment.portalUrl} />
                      )}
                    </div>
                  </div>

                  {selectedDeployment.notes && (
                    <div className="p-4 rounded-sm bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
                      <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Deployment Notes</h4>
                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">{selectedDeployment.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setSelectedDeployment(null)}
                  className="h-9 px-4 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-medium hover:text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
                {!readOnly && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const dep = selectedDeployment;
                        setSelectedDeployment(null);
                        openEditModal(dep);
                      }}
                      className="h-9 px-4 rounded-sm bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs font-mono hover:bg-zinc-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <HugeiconsIcon icon={Edit01Icon} size={14} />
                      <span>Edit Deployment</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal / Drawer for Deployment Registration Form */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
          <div className="w-full max-w-lg rounded-sm bg-[#0c0c0e]/95 border border-zinc-800/80 p-5 font-mono text-xs space-y-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <HugeiconsIcon icon={ComputerIcon} size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-sans tracking-tight">
                    {editingDeployment ? 'Edit Deployment' : 'Register Deployment'}
                  </h3>
                  <p className="text-[10px] text-zinc-500">Configure environment URLs and deployment endpoints</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="w-7 h-7 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={15} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 flex flex-col">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Environment (*)</label>
                  <Select value={env} onValueChange={(val) => setEnv(val as DeploymentEnvironment)}>
                    <SelectTrigger className="h-9 text-xs px-2.5 bg-zinc-900 border-zinc-800 font-mono text-zinc-200">
                      <SelectValue placeholder="Environment" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENVIRONMENTS.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g. v1.2.0"
                    className="w-full h-9 px-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-sm text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Frontend App URL</label>
                <input
                  type="url"
                  value={frontendUrl}
                  onChange={(e) => setFrontendUrl(e.target.value)}
                  placeholder="https://app.yourdomain.com"
                  className="w-full h-9 px-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-sm text-xs text-white outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Backend API Endpoint</label>
                <input
                  type="url"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="https://api.yourdomain.com"
                  className="w-full h-9 px-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-sm text-xs text-white outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Admin Console URL</label>
                  <input
                    type="url"
                    value={adminUrl}
                    onChange={(e) => setAdminUrl(e.target.value)}
                    placeholder="https://admin.yourdomain.com"
                    className="w-full h-9 px-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-sm text-xs text-white outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Client Portal URL</label>
                  <input
                    type="url"
                    value={portalUrl}
                    onChange={(e) => setPortalUrl(e.target.value)}
                    placeholder="https://bunker.internal/share/..."
                    className="w-full h-9 px-3 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-sm text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Deployment Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Vercel deployment with Supabase Postgres migrations"
                  className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 focus:border-zinc-600 rounded-sm text-xs text-white outline-none font-mono resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="h-9 px-4 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-medium hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={upsertMutation.isPending}
                  className="h-9 px-5 rounded-sm bg-white text-black font-semibold text-xs font-mono hover:bg-zinc-200 transition-colors cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {editingDeployment ? 'Save Deployment' : 'Register Environment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deploymentToDelete)}
        onClose={() => setDeploymentToDelete(null)}
        onConfirm={() => {
          if (deploymentToDelete) {
            deleteMutation.mutate({ id: deploymentToDelete.id, projectId: deploymentToDelete.projectId });
            setDeploymentToDelete(null);
          }
        }}
        title="Delete Deployment Entry"
        description={`Are you sure you want to delete ${deploymentToDelete?.environment} environment deployment (${deploymentToDelete?.version})? This action cannot be undone.`}
        confirmText="Delete Deployment"
      />
    </motion.div>
  );
};

interface UrlCellProps {
  url: string;
  onCopy: (url: string) => void;
  copied: boolean;
}

const UrlCell: React.FC<UrlCellProps> = ({ url, onCopy, copied }) => {
  const shortUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div className="flex items-center gap-1.5 group/url">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-[11px] font-mono text-zinc-300 hover:text-white hover:underline truncate max-w-[140px]"
        title={url}
      >
        {shortUrl}
      </a>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCopy(url);
        }}
        className="opacity-0 group-hover/url:opacity-100 p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
        title="Copy URL"
      >
        <HugeiconsIcon icon={copied ? CheckmarkCircle02Icon : Copy01Icon} size={11} className={copied ? 'text-emerald-400' : ''} />
      </button>
    </div>
  );
};

interface DrawerUrlRowProps {
  label: string;
  url: string;
  onCopy: (url: string) => void;
  copied: boolean;
}

const DrawerUrlRow: React.FC<DrawerUrlRowProps> = ({ label, url, onCopy, copied }) => {
  return (
    <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-mono text-zinc-200 hover:text-white truncate block hover:underline"
        >
          {url}
        </a>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onCopy(url)}
          className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Copy URL"
        >
          <HugeiconsIcon icon={copied ? CheckmarkCircle02Icon : Copy01Icon} size={12} className={copied ? 'text-emerald-400' : ''} />
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Open in new tab"
        >
          <HugeiconsIcon icon={Link01Icon} size={12} />
        </a>
      </div>
    </div>
  );
};

export default DeploymentsTab;
