export interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: string;
  createdAt: string;
  lastLoginAt: string;
  status: 'active' | 'suspended';
}

export interface ShareLinkDefaults {
  defaultExpiration: 'never' | '24h' | '7d' | '30d' | '90d';
  defaultModules: string[];
  requirePasswordByDefault: boolean;
  defaultMaxViews: number | null;
  linkPolicy: 'one_active_per_project' | 'multiple_active';
  jwtLifetime: '15m' | '30m' | '1h';
  enableViewCounter: boolean;
  enableUniqueVisitors: boolean;
  enableBrowserDetection: boolean;
  enableDeviceDetection: boolean;
  enableCountryDetection: boolean;
}

export interface PortalBranding {
  portalName: string;
  welcomeMessage: string;
  footerText: string;
  portalLogoUrl: string;
}

export interface StorageStats {
  totalProjects: number;
  totalClients: number;
  totalShareLinks: number;
  totalTasks: number;
  totalNotes: number;
  totalChangelogs: number;
  totalDeployments: number;
  totalPayments: number;
  totalDeliverables: number;
}
