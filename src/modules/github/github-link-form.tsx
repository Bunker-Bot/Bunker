import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { githubLinkFormSchema, parseGithubUrl, sanitizeGithubData, type GithubLinkFormData } from '../../lib/validators/github-link-schema';
import { useValidateGithubRepository, useConnectRepository } from '../../lib/supabase/queries/github';
import { Select } from '../../../packages/ui/src/components/select';
import { Badge } from '../../components/ui/badge';
import { RadialSpinner } from '../../components/ui/RadialSpinner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  GithubIcon,
  Link01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  GitBranchIcon,
  Cancel01Icon,
  StarIcon,
  CpuIcon
} from '@hugeicons/core-free-icons';

export interface GithubLinkFormProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  initialValues?: {
    repoUrl?: string;
    organization?: string;
    branch?: string;
    visibility?: 'public' | 'private';
  };
  onSuccess?: () => void;
}

export const GithubLinkForm: React.FC<GithubLinkFormProps> = ({
  isOpen,
  onClose,
  projectId,
  initialValues,
  onSuccess,
}) => {
  const [debouncedUrl, setDebouncedUrl] = useState(initialValues?.repoUrl || '');
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const connectMutation = useConnectRepository();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<GithubLinkFormData>({
    resolver: zodResolver(githubLinkFormSchema),
    defaultValues: {
      repo_url: initialValues?.repoUrl || '',
      organization: initialValues?.organization || '',
      branch: initialValues?.branch || 'main',
      visibility: initialValues?.visibility || 'private',
      display_name: '',
    },
  });

  const watchRepoUrl = watch('repo_url');
  const watchBranch = watch('branch');
  const watchVisibility = watch('visibility');

  // Debounce URL input (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUrl(watchRepoUrl || '');
    }, 500);
    return () => clearTimeout(timer);
  }, [watchRepoUrl]);

  const parsedUrl = parseGithubUrl(debouncedUrl);
  const { owner = '', repo = '' } = parsedUrl || {};

  // Validate repository server-side via Edge Function
  const {
    data: validateResult,
    isLoading: isValidating,
  } = useValidateGithubRepository(owner, repo, Boolean(owner && repo && isOpen));

  const metadata = validateResult?.metadata;

  // Auto-populate form fields when repository is validated
  useEffect(() => {
    if (metadata) {
      setValue('organization', metadata.owner || owner, { shouldValidate: true });
      setValue('branch', metadata.defaultBranch || 'main', { shouldValidate: true });
      setValue('visibility', metadata.visibility || 'private', { shouldValidate: true });
      if (!watch('display_name')) {
        setValue('display_name', metadata.name, { shouldValidate: true });
      }
    }
  }, [metadata, owner, setValue, watch]);

  const handleAttemptClose = useCallback(() => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  // Keyboard Shortcuts (Ctrl+S, Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSubmit(onSubmit)();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleAttemptClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleAttemptClose, handleSubmit]);

  const onSubmit = async (data: GithubLinkFormData) => {
    setServerError(null);
    try {
      const sanitized = sanitizeGithubData(data);
      await connectMutation.mutateAsync({
        projectId,
        repoUrl: sanitized.repo_url,
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'Failed to connect repository. Please verify access rights.');
    }
  };

  const branchOptions = metadata?.branches?.map((b: any) => ({
    value: b.name,
    label: b.name === metadata.defaultBranch ? `${b.name} (Default Branch)` : b.name,
  })) || [{ value: watchBranch || 'main', label: watchBranch || 'main' }];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end font-mono select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleAttemptClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative z-10 w-full max-w-lg h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col justify-between text-zinc-100 text-xs"
          >
            {/* Glass Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white">
                  <HugeiconsIcon icon={GithubIcon} size={16} />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-white">Attach GitHub Repository</h2>
                  <p className="text-[11px] text-zinc-400">Connect repository for CI/CD builds & commit telemetry.</p>
                </div>
              </div>

              <button
                onClick={handleAttemptClose}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="github-link-form" onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 overflow-y-auto flex-1">
              {serverError && (
                <div className="p-3 rounded-sm bg-rose-950/60 border border-rose-800/80 text-rose-300 flex items-center gap-2 text-xs">
                  <HugeiconsIcon icon={AlertCircleIcon} size={16} />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Section 1: Repository URL */}
              <div className="space-y-3 pb-3 border-b border-zinc-800/80">
                <h3 className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Repository Location</h3>

                <div>
                  <label className="block mb-1 font-bold text-zinc-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <HugeiconsIcon icon={Link01Icon} size={13} className="text-zinc-400" />
                      <span>Repository URL <span className="text-rose-500">*</span></span>
                    </span>
                    {isValidating && (
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <RadialSpinner size={12} />
                        <span>Validating repository...</span>
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    {...register('repo_url')}
                    placeholder="https://github.com/facebook/react"
                    className="w-full px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 outline-none focus:border-zinc-700 font-mono"
                  />
                  {errors.repo_url && <p className="mt-1 text-[11px] text-rose-400">{errors.repo_url.message}</p>}
                </div>
              </div>

              {/* Section 2: Live Repository Preview Card */}
              {metadata && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-sm bg-zinc-900 border border-zinc-800 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {metadata.ownerAvatar && (
                        <img src={metadata.ownerAvatar} alt={metadata.owner} className="w-6 h-6 rounded-full" />
                      )}
                      <div>
                        <h4 className="font-bold text-white text-xs">{metadata.fullName}</h4>
                        <p className="text-[10px] text-zinc-400">By {metadata.owner}</p>
                      </div>
                    </div>
                    <Badge variant={metadata.visibility === 'public' ? 'secondary' : 'outline'}>
                      {metadata.visibility}
                    </Badge>
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-2">{metadata.description}</p>

                  <div className="flex items-center gap-4 text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon icon={CpuIcon} size={13} className="text-zinc-500" />
                      <span>{metadata.language}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon icon={StarIcon} size={13} className="text-amber-400" />
                      <span>{metadata.stars} Stars</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon icon={GitBranchIcon} size={13} className="text-cyan-400" />
                      <span>{metadata.forks} Forks</span>
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Section 3: Configuration & Branch Selection */}
              <div className="space-y-3">
                <h3 className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Branch & Metadata Settings</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-zinc-200">Organization / Owner</label>
                    <input
                      type="text"
                      {...register('organization')}
                      readOnly
                      placeholder="Auto-detected"
                      className="w-full px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800/60 text-zinc-400 font-mono outline-none cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-zinc-200 flex items-center gap-1">
                      <HugeiconsIcon icon={GitBranchIcon} size={12} className="text-zinc-400" />
                      <span>Target Branch</span>
                    </label>
                    <Controller
                      name="branch"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onChange={field.onChange}
                          options={branchOptions}
                          className="w-full"
                        />
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-zinc-200">Detected Visibility</label>
                  <div className="px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800/60 flex items-center justify-between text-zinc-300">
                    <span className="capitalize font-bold">{watchVisibility} Repository</span>
                    <Badge variant={watchVisibility === 'public' ? 'secondary' : 'outline'}>
                      Read-Only
                    </Badge>
                  </div>
                </div>
              </div>
            </form>

            {/* Glass Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
              <span className="text-[10px] text-zinc-500 hidden sm:inline">Ctrl+S to Save | Esc to Close</span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAttemptClose}
                  className="px-4 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="github-link-form"
                  disabled={isSubmitting || connectMutation.isPending || isValidating}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting || connectMutation.isPending ? (
                    <RadialSpinner size={14} />
                  ) : (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
                  )}
                  <span>Connect Repository</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Unsaved Changes Protection Modal */}
          {showUnsavedModal && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono">
              <div className="w-full max-w-sm p-5 rounded-sm bg-zinc-950 border border-zinc-800 space-y-4 shadow-2xl">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <HugeiconsIcon icon={AlertCircleIcon} size={18} />
                  <span>Discard Unsaved Edits?</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  You have uncommitted repository configurations. Closing now will discard all changes.
                </p>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowUnsavedModal(false)}
                    className="px-4 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-800 cursor-pointer"
                  >
                    Keep Editing
                  </button>
                  <button
                    onClick={() => {
                      setShowUnsavedModal(false);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-sm bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 cursor-pointer shadow-sm"
                  >
                    Discard Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default GithubLinkForm;
