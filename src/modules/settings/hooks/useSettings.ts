import { useQuery } from '@tanstack/react-query';

export interface ProfileSettings {
  fullName: string;
  email: string;
  avatarUrl: string;
}

export interface AppearanceSettings {
  accentColor: string;
  compactMode: boolean;
  animationsEnabled: boolean;
  reducedMotion: boolean;
  glassIntensity: string;
  sidebarWidth: string;
  theme: string;
}

const DEFAULT_PROFILE: ProfileSettings = {
  fullName: 'Eswar Chinthakayala',
  email: 'eswarchinthakayala2004@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
};

const DEFAULT_APPEARANCE: AppearanceSettings = {
  accentColor: 'monochrome',
  compactMode: false,
  animationsEnabled: true,
  reducedMotion: false,
  glassIntensity: 'high',
  sidebarWidth: 'normal',
  theme: 'dark',
};

export function useProfileSettings() {
  return useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: async () => DEFAULT_PROFILE,
    initialData: DEFAULT_PROFILE,
  });
}

export function useAppearanceSettings() {
  return useQuery({
    queryKey: ['settings', 'appearance'],
    queryFn: async () => DEFAULT_APPEARANCE,
    initialData: DEFAULT_APPEARANCE,
  });
}

export default useProfileSettings;
