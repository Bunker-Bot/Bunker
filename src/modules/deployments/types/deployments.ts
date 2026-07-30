export type DeploymentEnvironment = 'local' | 'development' | 'staging' | 'production';

export type DeploymentStatus = 'active' | 'deploying' | 'successful' | 'failed' | 'rolled_back';

export interface DeploymentEntry {
  id: string;
  projectId: string;
  environment: DeploymentEnvironment;
  frontendUrl?: string | null;
  backendUrl?: string | null;
  apiUrl?: string | null;
  adminUrl?: string | null;
  portalUrl?: string | null;
  status: DeploymentStatus;
  version: string;
  notes?: string | null;
  deployedAt: string;
  createdAt: string;
  updatedAt: string;
  projectName?: string;
}

export interface CreateDeploymentInput {
  projectId: string;
  environment: DeploymentEnvironment;
  frontendUrl?: string;
  backendUrl?: string;
  apiUrl?: string;
  adminUrl?: string;
  portalUrl?: string;
  status?: DeploymentStatus;
  version?: string;
  notes?: string;
}

export interface UpdateDeploymentInput {
  id: string;
  projectId: string;
  environment?: DeploymentEnvironment;
  frontendUrl?: string;
  backendUrl?: string;
  apiUrl?: string;
  adminUrl?: string;
  portalUrl?: string;
  status?: DeploymentStatus;
  version?: string;
  notes?: string;
}
