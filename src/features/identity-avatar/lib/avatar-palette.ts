import type { AvatarMaterial, BunkerAvatarPalette } from '../types/avatar.types';

export interface PalettePreset {
  id: string;
  name: string;
  material: AvatarMaterial;
  primary: string;
  secondary: string;
  accent: string;
  visor: string;
  glow: string;
  metalness: number;
  roughness: number;
}

export const BUNKER_PALETTES: PalettePreset[] = [
  // 1. Obsidian Graphite (Default Enterprise Dark)
  {
    id: 'graphite-cyan',
    name: 'Obsidian Cyan',
    material: 'graphite',
    primary: '#232631',
    secondary: '#323746',
    accent: '#06B6D4',
    visor: '#0891B2',
    glow: '#22D3EE',
    metalness: 0.82,
    roughness: 0.28,
  },
  // 2. Deep Titanium Emerald
  {
    id: 'titanium-emerald',
    name: 'Titanium Emerald',
    material: 'titanium',
    primary: '#24282F',
    secondary: '#363C47',
    accent: '#10B981',
    visor: '#059669',
    glow: '#34D399',
    metalness: 0.78,
    roughness: 0.32,
  },
  // 3. Ceramic Cobalt / Indigo
  {
    id: 'ceramic-indigo',
    name: 'Stark Indigo',
    material: 'ceramic',
    primary: '#F4F4F6',
    secondary: '#E2E4E9',
    accent: '#6366F1',
    visor: '#4F46E5',
    glow: '#818CF8',
    metalness: 0.15,
    roughness: 0.18,
  },
  // 4. Matte Satin Amber
  {
    id: 'satin-amber',
    name: 'Monolith Amber',
    material: 'satin',
    primary: '#25262B',
    secondary: '#383A42',
    accent: '#F59E0B',
    visor: '#D97706',
    glow: '#FBBF24',
    metalness: 0.45,
    roughness: 0.48,
  },
  // 5. Slate Violet
  {
    id: 'slate-violet',
    name: 'Aether Violet',
    material: 'titanium',
    primary: '#252533',
    secondary: '#37374B',
    accent: '#8B5CF6',
    visor: '#7C3AED',
    glow: '#A78BFA',
    metalness: 0.75,
    roughness: 0.3,
  },
  // 6. Brushed Sky
  {
    id: 'brushed-sky',
    name: 'Brushed Sky',
    material: 'graphite',
    primary: '#1E293B',
    secondary: '#334155',
    accent: '#38BDF8',
    visor: '#0284C7',
    glow: '#7DD3FC',
    metalness: 0.8,
    roughness: 0.25,
  },
  // 7. Minimalist Monochrome
  {
    id: 'mono-zinc',
    name: 'Pure Zinc',
    material: 'titanium',
    primary: '#27272A',
    secondary: '#3F3F46',
    accent: '#E4E4E7',
    visor: '#71717A',
    glow: '#FAFAFA',
    metalness: 0.85,
    roughness: 0.22,
  },
  // 8. Crimson Sentinel
  {
    id: 'crimson-sentinel',
    name: 'Crimson Sentinel',
    material: 'graphite',
    primary: '#2A2226',
    secondary: '#3E3238',
    accent: '#F43F5E',
    visor: '#E11D48',
    glow: '#FB7185',
    metalness: 0.76,
    roughness: 0.35,
  },
];

/**
 * Adapt a preset to respect an explicit custom entity color (e.g. project hex color)
 */
export function customizePaletteWithColor(
  base: PalettePreset,
  preferredColor?: string | null
): BunkerAvatarPalette {
  if (!preferredColor || !preferredColor.startsWith('#')) {
    return {
      primary: base.primary,
      secondary: base.secondary,
      accent: base.accent,
      visor: base.visor,
      glow: base.glow,
      metalness: base.metalness,
      roughness: base.roughness,
    };
  }

  return {
    primary: base.primary,
    secondary: base.secondary,
    accent: preferredColor,
    visor: preferredColor,
    glow: preferredColor,
    metalness: base.metalness,
    roughness: base.roughness,
  };
}
