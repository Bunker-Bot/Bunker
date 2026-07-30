import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppTheme = 'dark' | 'light' | 'system';

interface LayoutState {
  isSidebarCollapsed: boolean;
  isMobileOpen: boolean;
  theme: AppTheme;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobile: () => void;
  setMobileOpen: (open: boolean) => void;
  setTheme: (theme: AppTheme) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      isMobileOpen: false,
      theme: 'dark',
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed: boolean) => set({ isSidebarCollapsed: collapsed }),
      toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      setMobileOpen: (open: boolean) => set({ isMobileOpen: open }),
      setTheme: (theme: AppTheme) => set({ theme }),
    }),
    {
      name: 'bunker-layout-settings',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);

export default useLayoutStore;
