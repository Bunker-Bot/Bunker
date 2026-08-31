export type EntityAvatarKind = 'client' | 'project' | 'generic';

export type AvatarArchetype = 'guardian' | 'architect' | 'sentinel' | 'operator';
export type GuardianArchetype = AvatarArchetype;

export type GuardianFamily =
  | 'core'
  | 'sentinel'
  | 'architect'
  | 'operator'
  | 'vanguard'
  | 'monolith'
  | 'vector'
  | 'aero'
  | 'command'
  | 'forge'
  | 'specter'
  | 'halo'
  | 'citadel'
  | 'signal'
  | 'atlas'
  | 'nova'
  | 'aegis'
  | 'obsidian'
  | 'prism'
  | 'nexus';

export type GuardianSilhouette = 'compact' | 'balanced' | 'wide' | 'tall' | 'heavy' | 'sleek';

export type AvatarMaterial =
  | 'graphite'
  | 'ceramic'
  | 'titanium'
  | 'satin'
  | 'black-ceramic'
  | 'white-ceramic'
  | 'brushed-titanium'
  | 'anodized-aluminum'
  | 'carbon-composite'
  | 'frosted-glass'
  | 'pearlescent-ceramic'
  | 'dark-chrome';

export type AvatarPose =
  | 'front'
  | 'three-quarter-left'
  | 'three-quarter-right'
  | 'observer'
  | 'command'
  | 'forward'
  | 'sentinel'
  | 'focused'
  | 'presentation';

export type GuardianSurfaceLanguage =
  | 'smooth'
  | 'architectural'
  | 'mechanical'
  | 'faceted'
  | 'layered'
  | 'monolithic';

export type GuardianDetailDensity = 'minimal' | 'balanced' | 'technical';

export type GuardianLightingPreset =
  | 'studio'
  | 'gallery'
  | 'soft-product'
  | 'executive'
  | 'midnight'
  | 'ceramic'
  | 'metal'
  | 'signal'
  | 'portal-dark'
  | 'portal-light'
  | 'share-card'
  | 'obsidian'
  | 'prism'
  | 'architectural';

export interface BunkerAvatarPalette {
  primary: string;
  secondary: string;
  accent: string;
  visor: string;
  glow: string;
  metalness: number;
  roughness: number;
}

export interface BunkerAvatarConfig {
  version: number;
  seed: string;
  archetype: AvatarArchetype;
  family?: GuardianFamily;
  silhouette?: GuardianSilhouette;
  headVariant: number;
  visorVariant: number;
  shoulderVariant: number;
  chestVariant?: number;
  collarVariant?: number;
  plinthVariant: number;
  material: AvatarMaterial;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  visorTint: string;
  glowColor: string;
  emblemVariant: number;
  pose: AvatarPose;
  environmentVariant: number;
  surfaceLanguage?: GuardianSurfaceLanguage;
  detailDensity?: GuardianDetailDensity;
  lightingPreset?: GuardianLightingPreset;
  metalness: number;
  roughness: number;
}

export interface AvatarIdentityInput {
  entityId: string;
  entityKind: EntityAvatarKind;
  name: string;
  preferredColor?: string | null;
  logoUrl?: string | null;
  status?: string | null;
  salt?: string;
  parentEntityId?: string | null;
}

export interface AvatarPosterProps {
  config: BunkerAvatarConfig;
  className?: string;
  size?: number | string;
  interactive?: boolean;
  showBackdrop?: boolean;
  badgeLogoUrl?: string | null;
  badgeText?: string | null;
  lookAtOffset?: { x: number; y: number };
}

export interface GuardianAvatarRecord {
  id: string;
  avatar_code: string;
  name: string;
  avatar_config: BunkerAvatarConfig;
  generator_version: number;
  project_id: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
    slug: string;
    status?: string;
    color?: string;
    client_id?: string;
    client?: {
      id: string;
      name: string;
      company?: string;
    };
  } | null;
}

export interface GuardianAvatarDTO {
  id: string;
  avatarCode: string;
  name: string;
  config: BunkerAvatarConfig;
  generatorVersion: number;
  projectId: string | null;
  projectName?: string | null;
  projectSlug?: string | null;
  projectStatus?: string | null;
  projectColor?: string | null;
  clientName?: string | null;
  isAssigned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AvatarStudioFilter = 'all' | 'assigned' | 'unassigned' | 'projects' | 'clients';

export type AvatarStudioViewMode = 'grid' | 'list';

export type AvatarPreviewContext = 'studio' | 'light-portal' | 'dark-portal' | 'share-card' | 'project' | 'portal';

export interface PublicPortalAvatar {
  id?: string;
  code: string;
  name: string;
  config: BunkerAvatarConfig;
  version: number;
}
