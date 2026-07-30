import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  useProfile,
  useUpdateProfile,
  useShareLinkDefaults,
  useUpdateShareLinkDefaults,
  usePortalBranding,
  useUpdatePortalBranding,
  useStorageStatistics,
  useDeleteExpiredShareLinks,
} from '../../lib/supabase/queries/settings';
import { authService } from '../auth/auth-service';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { PageHeader } from '../../components/project/PageHeader';
import { ConfirmDeleteDialog } from '../../components/ui/confirm-delete-dialog';
import { AppLogo } from '../../components/ui/AppLogo';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  Link01Icon,
  ShieldKeyIcon,
  DatabaseIcon,
  Alert02Icon,
  CheckmarkCircle02Icon,
  Edit01Icon,
  LockKeyIcon,
  Logout01Icon,
  GlobalIcon,
  Delete02Icon,
  Settings01Icon,
} from '@hugeicons/core-free-icons';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../components/ui/select';

const ALLOWED_MODULE_OPTIONS: { id: string; label: string }[] = [
  { id: 'overview', label: 'Project Overview' },
  { id: 'timeline', label: 'Timelines & Roadmap' },
  { id: 'milestones', label: 'Milestones & Tasks' },
  { id: 'screenshots', label: 'Screenshots & Gallery' },
  { id: 'documentation', label: 'Documentation' },
  { id: 'changelog', label: 'Changelog Notes' },
  { id: 'deployments', label: 'Deployments Status' },
  { id: 'downloads', label: 'Deliverable Releases' },
];

const RESTRICTED_MODULE_OPTIONS: { id: string; label: string }[] = [
  { id: 'tasks', label: 'Internal Tasks List' },
  { id: 'kanban', label: 'Kanban Board' },
  { id: 'notes', label: 'Private Notes Workspace' },
  { id: 'activity_logs', label: 'Activity Audit Logs' },
  { id: 'settings', label: 'System Settings' },
];

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  // Data Hooks
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const { data: shareDefaults } = useShareLinkDefaults();
  const updateShareDefaultsMutation = useUpdateShareLinkDefaults();

  const { data: branding } = usePortalBranding();
  const updateBrandingMutation = useUpdatePortalBranding();

  const { data: storageStats } = useStorageStatistics();
  const deleteExpiredLinksMutation = useDeleteExpiredShareLinks();

  // Local state for profile edit
  const [isEditingName, setIsEditingName] = useState(false);
  const [fullNameInput, setFullNameInput] = useState('');

  // Password Change Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  // Danger Dialog State
  const [isDeleteExpiredDialogOpen, setIsDeleteExpiredDialogOpen] = useState(false);
  const [dangerNotice, setDangerNotice] = useState<string | null>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameInput.trim()) return;
    await updateProfileMutation.mutateAsync({ fullName: fullNameInput.trim() });
    setIsEditingName(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || newPassword.length < 6) {
      setPasswordStatus('Password must be at least 6 characters.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordStatus('Password updated successfully.');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordStatus(null);
        setNewPassword('');
      }, 1500);
    } catch (err: any) {
      setPasswordStatus(err.message || 'Failed to update password.');
    }
  };

  const handleModuleToggle = (moduleId: string) => {
    if (!shareDefaults) return;
    const currentModules = shareDefaults.defaultModules || [];
    const nextModules = currentModules.includes(moduleId)
      ? currentModules.filter((m) => m !== moduleId)
      : [...currentModules, moduleId];

    updateShareDefaultsMutation.mutate({ defaultModules: nextModules });
  };

  const handleLogout = async () => {
    await authService.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-6 font-sans text-zinc-100 select-none pb-16 w-full max-w-[1700px] mx-auto"
    >
      {/* Shared Platform PageHeader Component */}
      <PageHeader
        title="Administrator Settings"
        description="Centralized single-admin configuration & client portal defaults"
        icon={Settings01Icon}
        badge={
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono inline-flex items-center gap-1.5">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
            Single Admin Authenticated
          </span>
        }
      />

      {/* Grid Layout: Left Main Column & Right Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Profile & Settings) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Administrator Profile */}
          <div className="p-5 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 space-y-5 font-mono text-xs shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={UserIcon} size={16} className="text-zinc-400" />
                <h2 className="text-xs font-bold text-white font-sans uppercase tracking-wider">
                  Administrator Profile
                </h2>
              </div>
              <span className="text-[10px] text-zinc-500">Read-Only Roles</span>
            </div>

            {isProfileLoading ? (
              <div className="h-24 rounded bg-zinc-900/50 animate-pulse" />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* First-letter Initial Badge */}
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center font-bold font-mono text-base text-white shadow-inner shrink-0">
                      {(profile?.fullName || 'E')[0].toUpperCase()}
                    </div>

                    <div className="space-y-0.5 min-w-0 truncate">
                      {!isEditingName ? (
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white font-sans truncate">{profile?.fullName}</h3>
                          <button
                            type="button"
                            onClick={() => {
                              setFullNameInput(profile?.fullName || '');
                              setIsEditingName(true);
                            }}
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors cursor-pointer shrink-0"
                          >
                            <HugeiconsIcon icon={Edit01Icon} size={12} />
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleProfileSave} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={fullNameInput}
                            onChange={(e) => setFullNameInput(e.target.value)}
                            className="h-8 px-2.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-white outline-none font-mono"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="h-8 px-3 rounded bg-white text-black font-semibold text-[11px] font-mono cursor-pointer shrink-0"
                          >
                            Save
                          </button>
                        </form>
                      )}
                      <div className="text-[11px] text-zinc-400 truncate">{profile?.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono uppercase inline-flex items-center gap-1">
                      <span className="text-zinc-500">Role:</span>
                      <span className="font-bold text-white">{(profile?.role && profile.role.trim()) ? profile.role : 'Administrator'}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono uppercase inline-flex items-center gap-1.5 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
                      {(profile?.status && profile.status.trim()) ? profile.status : 'Active'}
                    </span>
                  </div>
                </div>

                {/* Account Statistics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 font-mono">
                  <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/60 space-y-1">
                    <div className="text-[10px] text-zinc-500">Total Projects</div>
                    <div className="text-base font-bold text-white">{storageStats?.totalProjects || 0}</div>
                  </div>
                  <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/60 space-y-1">
                    <div className="text-[10px] text-zinc-500">Total Clients</div>
                    <div className="text-base font-bold text-white">{storageStats?.totalClients || 0}</div>
                  </div>
                  <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/60 space-y-1">
                    <div className="text-[10px] text-zinc-500">Share Links</div>
                    <div className="text-base font-bold text-emerald-400">{storageStats?.totalShareLinks || 0}</div>
                  </div>
                  <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/60 space-y-1">
                    <div className="text-[10px] text-zinc-500">Account Created</div>
                    <div className="text-[11px] font-bold text-zinc-300">
                      {profile?.createdAt ? format(new Date(profile.createdAt), 'MMM yyyy') : '2026'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Share Link Defaults */}
          <div className="p-5 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 space-y-5 font-mono text-xs shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Link01Icon} size={16} className="text-zinc-400" />
                <h2 className="text-xs font-bold text-white font-sans uppercase tracking-wider">
                  Share Link Defaults
                </h2>
              </div>
              <span className="text-[10px] text-zinc-500">Auto-Saving System</span>
            </div>

            <div className="space-y-4">
              {/* Expiration & Max Views Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">Default Link Expiration</label>
                  <Select
                    value={shareDefaults?.defaultExpiration || 'never'}
                    onValueChange={(val) => updateShareDefaultsMutation.mutate({ defaultExpiration: val as any })}
                  >
                    <SelectTrigger className="w-full h-9 text-xs px-3 bg-zinc-900 border-zinc-800 rounded-md font-mono text-zinc-200 focus:border-zinc-700">
                      <SelectValue placeholder="Select Expiration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never Expire</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="90d">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">Default Max Views</label>
                  <Select
                    value={shareDefaults?.defaultMaxViews ? String(shareDefaults.defaultMaxViews) : 'unlimited'}
                    onValueChange={(val) =>
                      updateShareDefaultsMutation.mutate({
                        defaultMaxViews: val === 'unlimited' ? null : Number(val),
                      })
                    }
                  >
                    <SelectTrigger className="w-full h-9 text-xs px-3 bg-zinc-900 border-zinc-800 rounded-md font-mono text-zinc-200 focus:border-zinc-700">
                      <SelectValue placeholder="Max Views" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unlimited">Unlimited Views</SelectItem>
                      <SelectItem value="100">100 Views</SelectItem>
                      <SelectItem value="250">250 Views</SelectItem>
                      <SelectItem value="500">500 Views</SelectItem>
                      <SelectItem value="1000">1000 Views</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Password Protection & Link Policy Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <label className="p-3.5 rounded-md bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between cursor-pointer hover:border-zinc-700/80 transition-colors h-full">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-white font-sans">Require Password by Default</div>
                    <div className="text-[10px] text-zinc-500 font-mono">Auto-enable PIN check when generating share links</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(shareDefaults?.requirePasswordByDefault)}
                    onChange={(e) => updateShareDefaultsMutation.mutate({ requirePasswordByDefault: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer shrink-0 ml-3"
                  />
                </label>

                <div className="p-3.5 rounded-md bg-zinc-900/60 border border-zinc-800/80 space-y-2 flex flex-col justify-between h-full">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-white font-sans">Active Link Policy</div>
                    <div className="text-[10px] text-zinc-500 font-mono">Rule for active links per project</div>
                  </div>
                  <Select
                    value={shareDefaults?.linkPolicy || 'one_active_per_project'}
                    onValueChange={(val) => updateShareDefaultsMutation.mutate({ linkPolicy: val as any })}
                  >
                    <SelectTrigger className="w-full h-8 text-[11px] px-2.5 bg-zinc-900 border-zinc-800 rounded-md font-mono text-zinc-200">
                      <SelectValue placeholder="Policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_active_per_project">One Active Link Per Project (Recommended)</SelectItem>
                      <SelectItem value="multiple_active">Allow Multiple Active Links</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Default Allowed Portal Modules Checkbox Group */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Default Enabled Client Portal Modules
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {ALLOWED_MODULE_OPTIONS.map((m) => {
                    const checked = (shareDefaults?.defaultModules || []).includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleModuleToggle(m.id)}
                        className={`p-2 rounded border text-left transition-colors cursor-pointer ${
                          checked
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <div className="text-[11px] font-mono font-semibold flex items-center justify-between">
                          <span>{m.label}</span>
                          {checked && <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Restricted Modules Notice */}
              <div className="p-3 rounded bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HugeiconsIcon icon={ShieldKeyIcon} size={12} />
                  <span>Restricted Modules (Strictly Admin Internal)</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {RESTRICTED_MODULE_OPTIONS.map((rm) => (
                    <span key={rm.id} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 line-through">
                      {rm.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Portal Branding & Preview */}
          <div className="p-5 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 space-y-5 font-mono text-xs shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={GlobalIcon} size={16} className="text-zinc-400" />
                <h2 className="text-xs font-bold text-white font-sans uppercase tracking-wider">
                  Portal Branding Configuration
                </h2>
              </div>
              <span className="text-[10px] text-zinc-500">Live Client View</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Portal Name</label>
                <input
                  type="text"
                  value={branding?.portalName || ''}
                  onChange={(e) => updateBrandingMutation.mutate({ portalName: e.target.value })}
                  placeholder="e.g. Client Command Portal"
                  className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded text-xs text-white outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Welcome Message Banner</label>
                <textarea
                  rows={2}
                  value={branding?.welcomeMessage || ''}
                  onChange={(e) => updateBrandingMutation.mutate({ welcomeMessage: e.target.value })}
                  placeholder="Welcome message displayed at the top of client share links..."
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded text-xs text-white outline-none font-mono resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Footer Branding Text</label>
                <input
                  type="text"
                  value={branding?.footerText || ''}
                  onChange={(e) => updateBrandingMutation.mutate({ footerText: e.target.value })}
                  placeholder="e.g. Powered by Bunker Agency Engine"
                  className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded text-xs text-white outline-none font-mono"
                />
              </div>

              {/* Live Preview Banner Box */}
              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Client View Live Preview Banner</span>
                  <span className="text-emerald-400 font-bold">Encrypted Session</span>
                </div>

                <div className="p-3 rounded bg-[#0a0a0c] border border-zinc-800/80 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <AppLogo size={24} showText={false} />
                    <span className="font-bold text-white text-xs font-sans">{branding?.portalName}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">{branding?.welcomeMessage}</p>
                  <div className="text-[9px] text-zinc-600 border-t border-zinc-900 pt-1.5">{branding?.footerText}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Security, Storage, Danger Zone) */}
        <div className="space-y-6">
          {/* Section 4: Security */}
          <div className="p-5 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 space-y-4 font-mono text-xs shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={ShieldKeyIcon} size={16} className="text-emerald-400" />
                <h2 className="text-xs font-bold text-white font-sans uppercase tracking-wider">
                  Security Preferences
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/60 space-y-1">
                <div className="text-[10px] text-zinc-500">Authentication Provider</div>
                <div className="text-xs font-bold text-white">Supabase Auth (JWT Encrypted)</div>
              </div>

              <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/60 space-y-1">
                <div className="text-[10px] text-zinc-500">Last Login Timestamp</div>
                <div className="text-xs font-bold text-zinc-200">
                  {profile?.lastLoginAt ? format(new Date(profile.lastLoginAt), 'MMM d, yyyy HH:mm') : 'Active Session'}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full h-9 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-white inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <HugeiconsIcon icon={LockKeyIcon} size={14} />
                  <span>Change Password</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full h-9 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-mono inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <HugeiconsIcon icon={Logout01Icon} size={14} />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Storage Overview */}
          <div className="p-5 rounded-lg bg-[#0c0c0d] border border-zinc-800/60 space-y-4 font-mono text-xs shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={DatabaseIcon} size={16} className="text-zinc-400" />
                <h2 className="text-xs font-bold text-white font-sans uppercase tracking-wider">
                  Storage & Database Matrix
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Projects & Tasks</span>
                  <span className="text-white font-bold">{(storageStats?.totalProjects || 0) + (storageStats?.totalTasks || 0)} entries</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[65%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Deliverable Releases</span>
                  <span className="text-white font-bold">{storageStats?.totalDeliverables || 0} files</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full w-[45%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Changelogs & Deployments</span>
                  <span className="text-white font-bold">{(storageStats?.totalChangelogs || 0) + (storageStats?.totalDeployments || 0)} logs</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[30%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Danger Zone */}
          <div className="p-5 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-4 font-mono text-xs shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2 text-rose-400">
                <HugeiconsIcon icon={Alert02Icon} size={16} />
                <h2 className="text-xs font-bold font-sans uppercase tracking-wider">Danger Zone</h2>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsDeleteExpiredDialogOpen(true)}
                className="w-full h-9 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-mono inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
                <span>Delete Expired Share Links</span>
              </button>

              {dangerNotice && (
                <div className="text-[10px] text-emerald-400 text-center font-mono pt-1">
                  {dangerNotice}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
          <div className="w-full max-w-sm rounded-lg bg-[#0c0c0e] border border-zinc-800 p-5 font-mono text-xs space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white font-sans">Change Administrator Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password (min 6 chars)"
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded text-xs text-white outline-none font-mono"
              />

              {passwordStatus && <p className="text-[10px] text-amber-400">{passwordStatus}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="h-8 px-3 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-white text-black font-semibold text-xs font-mono cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Expired Links Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteExpiredDialogOpen}
        onClose={() => setIsDeleteExpiredDialogOpen(false)}
        onConfirm={async () => {
          const count = await deleteExpiredLinksMutation.mutateAsync();
          setDangerNotice(`Successfully purged ${count} expired share links.`);
          setIsDeleteExpiredDialogOpen(false);
          setTimeout(() => setDangerNotice(null), 3000);
        }}
        title="Delete Expired Share Links"
        description="Are you sure you want to permanently delete all expired share links? Active share links will not be affected."
        confirmText="Purge Expired Links"
      />
    </motion.div>
  );
};

export default SettingsPage;
