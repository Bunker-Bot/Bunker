import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateClient, useUpdateClient } from '../../lib/supabase/queries/clients';
import { CountrySelect } from '../../components/country-select';
import { TimezoneSelect } from '../../components/timezone-select';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  UserIcon,
  Building01Icon,
  Mail01Icon,
  CallIcon,
  GithubIcon,
  Link01Icon,
  Tick02Icon,
  NoteIcon
} from '@hugeicons/core-free-icons';

const clientFormSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters'),
  company: z.string().optional(),
  email: z.string().email('Please enter a valid email address').or(z.literal('')).optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  website: z.string().optional(),
  github_username: z.string().optional(),
  notes: z.string().optional(),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  youtube: z.string().optional(),
});

export type ClientDrawerFormData = z.infer<typeof clientFormSchema>;

interface ClientFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: any | null;
  mode?: 'create' | 'edit' | 'preview';
}

export const ClientFormDrawer: React.FC<ClientFormDrawerProps> = ({
  isOpen,
  onClose,
  clientToEdit = null,
  mode = 'create',
}) => {
  const isEditing = Boolean(clientToEdit) || mode === 'edit';
  const isPreview = mode === 'preview';

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ClientDrawerFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      country: 'Global',
      timezone: 'UTC',
      website: '',
      github_username: '',
      notes: '',
      linkedin: '',
      portfolio: '',
      twitter: '',
      instagram: '',
      facebook: '',
      youtube: '',
    },
  });

  // Populate default values or auto-detect browser timezone
  useEffect(() => {
    if (clientToEdit) {
      const social = clientToEdit.socialLinks || {};
      reset({
        name: clientToEdit.name || '',
        company: clientToEdit.company || '',
        email: clientToEdit.email || '',
        phone: clientToEdit.phone || '',
        country: clientToEdit.country || 'Global',
        timezone: clientToEdit.timezone || 'UTC',
        website: clientToEdit.website || '',
        github_username: clientToEdit.githubUsername || clientToEdit.github_username || '',
        notes: clientToEdit.notes || '',
        linkedin: social.linkedin || '',
        portfolio: social.portfolio || '',
        twitter: social.twitter || '',
        instagram: social.instagram || '',
        facebook: social.facebook || '',
        youtube: social.youtube || '',
      });
    } else {
      let detectedTimezone = 'UTC';
      try {
        detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      } catch (e) {
        detectedTimezone = 'UTC';
      }

      reset({
        name: '',
        company: '',
        email: '',
        phone: '',
        country: 'Global',
        timezone: detectedTimezone,
        website: '',
        github_username: '',
        notes: '',
        linkedin: '',
        portfolio: '',
        twitter: '',
        instagram: '',
        facebook: '',
        youtube: '',
      });
    }
  }, [clientToEdit, reset]);

  // Keyboard ESC Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !createMutation.isPending && !updateMutation.isPending) {
        if (!isDirty || confirm('Discard unsaved client changes?')) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDirty, onClose, createMutation.isPending, updateMutation.isPending]);

  if (!isOpen) return null;

  const onSubmit = async (data: ClientDrawerFormData) => {
    const payload = {
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      country: data.country,
      timezone: data.timezone,
      website: data.website,
      github_username: data.github_username,
      notes: data.notes,
      social_links: {
        linkedin: data.linkedin,
        portfolio: data.portfolio,
        twitter: data.twitter,
        instagram: data.instagram,
        facebook: data.facebook,
        youtube: data.youtube,
      },
    };

    if (isEditing) {
      await updateMutation.mutateAsync({ id: clientToEdit.id, data: payload as any });
    } else {
      await createMutation.mutateAsync(payload as any);
    }
    onClose();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex justify-end select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isPending && (!isDirty || confirm('Discard unsaved client changes?'))) onClose();
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-lg h-full bg-zinc-950 border-l border-zinc-800 flex flex-col justify-between font-mono text-xs text-zinc-100 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {isPreview ? 'Client Overview' : isEditing ? 'Edit Client Record' : 'Register New Client'}
              </h2>
              <p className="text-[11px] text-zinc-400">
                {isPreview
                  ? 'Viewing client parameters'
                  : isEditing
                  ? 'Update existing client parameters'
                  : 'Enter client details to assign projects.'}
              </p>
            </div>
            <button
              onClick={() => {
                if (!isPending && (!isDirty || confirm('Discard unsaved client changes?'))) onClose();
              }}
              className="p-1 rounded-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>
          </div>

          {/* Form Scrollable Body */}
          <form id="client-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Section 1: Basic Information */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-1 flex items-center gap-1.5">
                <HugeiconsIcon icon={UserIcon} size={13} />
                <span>1. Primary Contact Info</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-300">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  {...register('name')}
                  disabled={isPreview || isPending}
                  placeholder="e.g. Acme Corporation or Jane Doe"
                  className="w-full px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                />
                {errors.name && <p className="text-[10px] text-rose-400">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    Company Name
                  </label>
                  <div className="relative">
                    <input
                      {...register('company')}
                      disabled={isPreview || isPending}
                      placeholder="Acme Inc."
                      className="w-full pl-8 pr-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                    />
                    <HugeiconsIcon
                      icon={Building01Icon}
                      size={14}
                      className="absolute left-2.5 top-2.5 text-zinc-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      {...register('email')}
                      disabled={isPreview || isPending}
                      placeholder="client@acme.com"
                      className="w-full pl-8 pr-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                    />
                    <HugeiconsIcon icon={Mail01Icon} size={14} className="absolute left-2.5 top-2.5 text-zinc-500" />
                  </div>
                  {errors.email && <p className="text-[10px] text-rose-400">{errors.email.message}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Location */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-1 flex items-center gap-1.5">
                <HugeiconsIcon icon={CallIcon} size={13} />
                <span>2. Location & Timezone</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300">Country</label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <CountrySelect
                        value={field.value || 'Global'}
                        onChange={field.onChange}
                        disabled={isPreview || isPending}
                      />
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300">Timezone</label>
                  <Controller
                    name="timezone"
                    control={control}
                    render={({ field }) => (
                      <TimezoneSelect
                        value={field.value || 'UTC'}
                        onChange={field.onChange}
                        disabled={isPreview || isPending}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-300">Phone Number</label>
                <div className="relative">
                  <input
                    {...register('phone')}
                    disabled={isPreview || isPending}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-8 pr-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                  />
                  <HugeiconsIcon icon={CallIcon} size={14} className="absolute left-2.5 top-2.5 text-zinc-500" />
                </div>
              </div>
            </div>

            {/* Section 3: Web & GitHub Profiles */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-1 flex items-center gap-1.5">
                <HugeiconsIcon icon={Link01Icon} size={13} />
                <span>3. Online Presence</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300">Website URL</label>
                  <div className="relative">
                    <input
                      {...register('website')}
                      disabled={isPreview || isPending}
                      placeholder="https://acme.com"
                      className="w-full pl-8 pr-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                    />
                    <HugeiconsIcon icon={Link01Icon} size={14} className="absolute left-2.5 top-2.5 text-zinc-500" />
                  </div>
                  {errors.website && <p className="text-[10px] text-rose-400">{errors.website.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300">GitHub Handle</label>
                  <div className="relative">
                    <input
                      {...register('github_username')}
                      disabled={isPreview || isPending}
                      placeholder="acme-org"
                      className="w-full pl-8 pr-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                    />
                    <HugeiconsIcon icon={GithubIcon} size={14} className="absolute left-2.5 top-2.5 text-zinc-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Social Links (JSONB) */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-1">
                4. Social Profiles (JSONB)
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  {...register('linkedin')}
                  disabled={isPreview || isPending}
                  placeholder="LinkedIn URL"
                  className="px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                />
                <input
                  {...register('portfolio')}
                  disabled={isPreview || isPending}
                  placeholder="Portfolio URL"
                  className="px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                />
                <input
                  {...register('twitter')}
                  disabled={isPreview || isPending}
                  placeholder="X / Twitter URL"
                  className="px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                />
                <input
                  {...register('instagram')}
                  disabled={isPreview || isPending}
                  placeholder="Instagram URL"
                  className="px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Section 5: Internal Admin Notes */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-1 flex items-center gap-1.5">
                <HugeiconsIcon icon={NoteIcon} size={13} />
                <span>5. Internal Admin Notes</span>
              </div>
              <textarea
                {...register('notes')}
                rows={3}
                disabled={isPreview || isPending}
                placeholder="Internal client notes, contract terms, or special requirements..."
                className="w-full px-3 py-2 rounded-sm bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 disabled:opacity-50 resize-none"
              />
            </div>
          </form>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                if (!isPending && (!isDirty || confirm('Discard unsaved client changes?'))) onClose();
              }}
              disabled={isPending}
              className="px-4 py-2 rounded-sm bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            {!isPreview && (
              <button
                type="submit"
                form="client-form"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-sm bg-white text-black font-bold hover:bg-zinc-200 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isPending ? (
                  <span>Saving Record...</span>
                ) : (
                  <>
                    <HugeiconsIcon icon={Tick02Icon} size={16} />
                    <span>{isEditing ? 'Update Client' : 'Create Client'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ClientFormDrawer;
