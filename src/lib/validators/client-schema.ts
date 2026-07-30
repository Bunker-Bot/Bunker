import { z } from 'zod';
import { COUNTRIES } from '../../constants/countries';
import { TIMEZONES } from '../../constants/timezones';

// Standard ISO Country names list
const VALID_COUNTRY_NAMES = COUNTRIES.map((c: { name: string }) => c.name);

// Standard IANA Timezone names list
const VALID_TIMEZONE_NAMES = TIMEZONES.map((t: { value: string }) => t.value);

export const ClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Client name must be at least 2 characters' })
    .max(120, { message: 'Client name cannot exceed 120 characters' }),

  company: z
    .string()
    .trim()
    .max(150, { message: 'Company name cannot exceed 150 characters' })
    .nullable()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Please enter a valid email address' })
    .or(z.literal(''))
    .nullable()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val.trim().toLowerCase() : null)),

  phone: z
    .string()
    .trim()
    .max(30, { message: 'Phone number cannot exceed 30 characters' })
    .nullable()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),

  country: z
    .string()
    .trim()
    .refine((val) => !val || VALID_COUNTRY_NAMES.includes(val) || val === 'Global', {
      message: 'Please select a valid country',
    })
    .default('Global'),

  timezone: z
    .string()
    .trim()
    .refine((val) => !val || VALID_TIMEZONE_NAMES.includes(val) || val === 'UTC', {
      message: 'Please select a valid IANA timezone',
    })
    .default('UTC'),

  website: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === '') return null;
      let url = val.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }
      return url;
    }),

  notes: z
    .string()
    .trim()
    .max(5000, { message: 'Internal notes cannot exceed 5000 characters' })
    .nullable()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),

  github_username: z
    .string()
    .trim()
    .max(39, { message: 'GitHub username cannot exceed 39 characters' })
    .regex(/^[a-zA-Z0-9-]*$/, { message: 'GitHub username contains invalid characters' })
    .nullable()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === '') return null;
      return val.trim().replace(/^@/, '');
    }),

  social_links: z
    .object({
      linkedin: z.string().optional(),
      portfolio: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional()
    .default({}),
});

export type ClientFormData = z.infer<typeof ClientSchema>;

export type ClientInsertData = z.input<typeof ClientSchema> & {
  created_by?: string;
};

export type ClientUpdateData = Partial<ClientInsertData>;

/**
 * Pre-submission Sanitization Helper
 */
export const sanitizeClientData = (data: Partial<ClientFormData>): Record<string, any> => {
  const sanitized: Record<string, any> = {};

  if (data.name !== undefined) sanitized.name = data.name.trim();
  if (data.company !== undefined) sanitized.company = data.company && data.company.trim() !== '' ? data.company.trim() : null;
  if (data.email !== undefined) sanitized.email = data.email && data.email.trim() !== '' ? data.email.trim().toLowerCase() : null;
  if (data.phone !== undefined) sanitized.phone = data.phone && data.phone.trim() !== '' ? data.phone.trim() : null;
  if (data.country !== undefined) sanitized.country = data.country || 'Global';
  if (data.timezone !== undefined) sanitized.timezone = data.timezone || 'UTC';

  if (data.website !== undefined) {
    if (!data.website || data.website.trim() === '') {
      sanitized.website = null;
    } else {
      let url = data.website.trim();
      if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
      sanitized.website = url;
    }
  }

  if (data.notes !== undefined) sanitized.notes = data.notes && data.notes.trim() !== '' ? data.notes.trim() : null;

  if (data.github_username !== undefined) {
    sanitized.github_username = data.github_username && data.github_username.trim() !== ''
      ? data.github_username.trim().replace(/^@/, '')
      : null;
  }

  if (data.social_links !== undefined) {
    const cleanSocial: Record<string, string> = {};
    Object.entries(data.social_links || {}).forEach(([key, val]) => {
      if (val && typeof val === 'string' && val.trim() !== '') {
        let link = val.trim();
        if (!/^https?:\/\//i.test(link)) link = `https://${link}`;
        cleanSocial[key] = link;
      }
    });
    sanitized.social_links = cleanSocial;
  }

  return sanitized;
};
