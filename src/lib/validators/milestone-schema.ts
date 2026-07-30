import { z } from 'zod';

export const milestoneDeliverableSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Deliverable name is required'),
  type: z.string().optional(),
  status: z.enum(['completed', 'in_progress', 'pending']).default('pending'),
  url: z.string().optional(),
});

export const milestoneAttachmentSchema = z.object({
  id: z.string(),
  file_name: z.string().min(1, 'File name is required'),
  file_url: z.string().min(1, 'File URL is required'),
  file_type: z.string().optional(),
  file_size: z.string().optional(),
});

export const milestoneFormSchema = z
  .object({
    id: z.string().optional(),
    project_id: z.string().optional(),
    name: z
      .string()
      .min(2, 'Milestone name must be at least 2 characters')
      .max(120, 'Milestone name must be at most 120 characters'),
    description: z
      .string()
      .max(50000, 'Description must not exceed 50,000 characters')
      .default(''),
    status: z
      .enum(['planned', 'in_progress', 'blocked', 'completed', 'cancelled'])
      .default('in_progress'),
    priority: z
      .enum(['low', 'medium', 'high', 'urgent'])
      .default('medium'),
    progress: z
      .number()
      .min(0, 'Progress cannot be negative')
      .max(100, 'Progress cannot exceed 100%')
      .default(0),
    start_date: z.string().optional(),
    due_date: z.string().min(1, 'Target due date is required'),
    completion_date: z.string().optional(),
    is_client_visible: z.boolean().default(true),
    completion_rule: z
      .enum(['progress_100', 'all_deliverables', 'manual'])
      .default('progress_100'),
    deliverables: z.array(milestoneDeliverableSchema).max(100).default([]),
    dependencies: z.array(z.string()).default([]),
    attachments: z.array(milestoneAttachmentSchema).default([]),
    owner_name: z.string().default('Project Team'),
    version: z.string().default('v1.0'),
    sprint: z.string().default('Sprint 1'),
    labels: z.array(z.string()).default([]),
    sort_order: z.number().default(0),
  })
  .refine(
    (data) => {
      if (data.completion_date && data.due_date) {
        return new Date(data.completion_date) >= new Date(data.due_date);
      }
      return true;
    },
    {
      message: 'Completion date cannot be earlier than due date',
      path: ['completion_date'],
    }
  );

export type MilestoneFormData = z.infer<typeof milestoneFormSchema>;
