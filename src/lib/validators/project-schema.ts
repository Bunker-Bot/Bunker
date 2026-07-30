import { z } from 'zod';

export const RESERVED_SLUGS = [
  'admin',
  'dashboard',
  'settings',
  'login',
  'share',
  'api',
  'assets',
  'new',
  'create',
  'edit',
];

export const ProjectStatusEnum = z.enum([
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
]);

export const ProjectPriorityEnum = z.enum([
  'low',
  'medium',
  'high',
  'urgent',
]);

export const projectFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(120, 'Project name cannot exceed 120 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(140, 'Slug cannot exceed 140 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .refine((val) => !RESERVED_SLUGS.includes(val.toLowerCase()), {
      message: 'This slug is reserved system-wide. Please choose a different slug.',
    }),
  description: z.string().optional().or(z.literal('')),
  client_id: z.string().optional().or(z.literal('')),
  status: ProjectStatusEnum,
  priority: ProjectPriorityEnum,
  start_date: z.string().optional().or(z.literal('')),
  deadline: z.string().optional().or(z.literal('')),
  completion_percent: z.number().min(0).max(100),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color'),
  thumbnail_url: z.string().optional().or(z.literal('')),
  github_repo_url: z.string().optional().or(z.literal('')),
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;

export const sanitizeProjectData = (data: ProjectFormData) => {
  const cleanSlug = data.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)+/g, '');

  return {
    name: data.name.trim(),
    slug: cleanSlug,
    description: data.description?.trim() || null,
    client_id: data.client_id || null,
    status: data.status,
    priority: data.priority,
    start_date: data.start_date || null,
    deadline: data.deadline || null,
    completion_percent: Math.min(100, Math.max(0, Number(data.completion_percent) || 0)),
    color: data.color || '#E11D48',
    thumbnail_url: data.thumbnail_url?.trim() || null,
    github_repo_url: data.github_repo_url?.trim() || null,
  };
};
