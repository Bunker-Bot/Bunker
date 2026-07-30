import type { GenerateShareLinkRequest } from './types.ts';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const FORBIDDEN_INTERNAL_MODULES = [
  'tasks',
  'kanban',
  'notes',
  'activity_logs',
  'settings',
  'analytics',
  'billing',
];

const DEFAULT_ALLOWED_MODULES = [
  'overview',
  'timeline',
  'milestones',
  'screenshots',
  'documentation',
  'files',
  'deployments',
  'github',
  'changelog',
];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: {
    projectId: string;
    name: string;
    expiresAt: string | null;
    password?: string;
    maxViews: number | null;
    modulePermissions: Record<string, boolean>;
    notes?: string | null;
    clientName?: string | null;
    label?: string | null;
    purpose?: string | null;
  };
}

export function validateShareLinkPayload(body: GenerateShareLinkRequest): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Request body must be a JSON object.' };
  }

  const {
    projectId,
    name,
    expiresAt,
    expirationPreset,
    password,
    notes,
    clientName,
    label,
    purpose,
    allowedModules,
    maxViews,
  } = body;

  // 1. Validate Project UUID
  if (!projectId || typeof projectId !== 'string' || !UUID_REGEX.test(projectId)) {
    return { isValid: false, error: 'Invalid or missing Project UUID format.' };
  }

  // 2. Calculate Expiration Timestamp
  let validExpiresAt: string | null = null;
  if (expirationPreset && expirationPreset !== 'never' && expirationPreset !== 'custom') {
    const now = new Date();
    switch (expirationPreset) {
      case '1h':
        now.setHours(now.getHours() + 1);
        break;
      case '6h':
        now.setHours(now.getHours() + 6);
        break;
      case '12h':
        now.setHours(now.getHours() + 12);
        break;
      case '24h':
        now.setHours(now.getHours() + 24);
        break;
      case '7d':
        now.setDate(now.getDate() + 7);
        break;
      case '30d':
        now.setDate(now.getDate() + 30);
        break;
      case '90d':
        now.setDate(now.getDate() + 90);
        break;
    }
    validExpiresAt = now.toISOString();
  } else if (expiresAt) {
    const expDate = new Date(expiresAt);
    if (isNaN(expDate.getTime())) {
      return { isValid: false, error: 'Invalid expiration date format.' };
    }
    if (expDate <= new Date()) {
      return { isValid: false, error: 'Expiration timestamp must be in the future.' };
    }
    validExpiresAt = expDate.toISOString();
  }

  // 3. Validate Password
  if (password !== undefined && password !== null && password !== '') {
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return { isValid: false, error: 'Password must be between 8 and 128 characters.' };
    }
  }

  // 4. Validate Maximum Views
  let validMaxViews: number | null = null;
  if (maxViews !== undefined && maxViews !== null) {
    const parsedViews = Number(maxViews);
    if (isNaN(parsedViews) || parsedViews <= 0) {
      return { isValid: false, error: 'Maximum views must be a positive integer.' };
    }
    validMaxViews = Math.floor(parsedViews);
  }

  // 5. Sanitize Module Permissions
  const modulePermissions: Record<string, boolean> = {};
  const modulesToConfigure = Array.isArray(allowedModules)
    ? allowedModules
    : DEFAULT_ALLOWED_MODULES;

  modulesToConfigure.forEach((mod: string) => {
    const normalized = String(mod).toLowerCase().trim();
    if (!FORBIDDEN_INTERNAL_MODULES.includes(normalized)) {
      modulePermissions[normalized] = true;
    }
  });

  return {
    isValid: true,
    sanitized: {
      projectId,
      name: String(name || 'Client Review').trim().slice(0, 100),
      expiresAt: validExpiresAt,
      password: password && password.trim() ? password.trim() : undefined,
      maxViews: validMaxViews,
      modulePermissions,
      notes: notes ? String(notes).trim().slice(0, 500) : null,
      clientName: clientName ? String(clientName).trim().slice(0, 100) : null,
      label: label ? String(label).trim().slice(0, 50) : null,
      purpose: purpose ? String(purpose).trim().slice(0, 100) : null,
    },
  };
}
