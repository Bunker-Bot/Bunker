import type { BunkerAvatarConfig } from '../../../features/identity-avatar/types/avatar.types';

export type PortalEntryStage =
  | 'initializing'
  | 'validating-link'
  | 'resolving-access'
  | 'loading-identity'
  | 'loading-project'
  | 'checking-portal-state'
  | 'preparing-assets'
  | 'ready'
  | 'password-required'
  | 'access-restricted'
  | 'expired'
  | 'revoked'
  | 'invalid'
  | 'error';

export type GuardianPortalMood =
  | 'dormant'
  | 'awakening'
  | 'checking'
  | 'focused'
  | 'ready'
  | 'attention'
  | 'restricted'
  | 'unavailable';

export interface SafePortalProject {
  id: string;
  name: string;
  description?: string | null;
  status?: string | null;
  color?: string | null;
  completionPercent?: number | null;
  currency?: string | null;
  budget?: number | null;
  clientName?: string | null;
  avatarCode?: string | null;
  avatarConfig?: BunkerAvatarConfig | null;
}

export interface SafePortalClient {
  id?: string | null;
  displayName: string;
  logoUrl?: string | null;
}

export interface PortalEntryState {
  stage: PortalEntryStage;
  progress: number;
  stageLabel: string;
  project: SafePortalProject | null;
  client: SafePortalClient | null;
  avatarConfig: BunkerAvatarConfig;
  avatarCode: string;
  guardianMood: GuardianPortalMood;
  isReady: boolean;
  isPasswordRequired: boolean;
  errorMessage: string | null;
  accessStatus: 'confirmed' | 'pending' | 'restricted' | 'checking';
  paymentProgress?: {
    totalPaid: number;
    totalBudget: number;
    percent: number;
    isFullyPaid: boolean;
    currencySymbol: string;
  } | null;
}

export interface StageWeightDef {
  stage: PortalEntryStage;
  weight: number;
  label: string;
  mood: GuardianPortalMood;
}

export const STAGE_DEFINITIONS: Record<PortalEntryStage, { weight: number; label: string; mood: GuardianPortalMood }> = {
  initializing: { weight: 8, label: 'Preparing secure portal', mood: 'dormant' },
  'validating-link': { weight: 22, label: 'Validating share access', mood: 'awakening' },
  'resolving-access': { weight: 38, label: 'Resolving project access', mood: 'awakening' },
  'loading-identity': { weight: 52, label: 'Loading project identity', mood: 'checking' },
  'loading-project': { weight: 68, label: 'Preparing client workspace', mood: 'focused' },
  'checking-portal-state': { weight: 82, label: 'Checking workspace security', mood: 'focused' },
  'preparing-assets': { weight: 94, label: 'Finalizing portal access', mood: 'ready' },
  ready: { weight: 100, label: 'Your portal is ready', mood: 'ready' },
  'password-required': { weight: 38, label: 'Passcode authentication required', mood: 'checking' },
  'access-restricted': { weight: 82, label: 'Action required before access', mood: 'attention' },
  expired: { weight: 100, label: 'This shared link has expired', mood: 'unavailable' },
  revoked: { weight: 100, label: 'This shared access is no longer available', mood: 'unavailable' },
  invalid: { weight: 100, label: "This shared link isn't available", mood: 'unavailable' },
  error: { weight: 100, label: 'We could not prepare this portal', mood: 'attention' },
};
