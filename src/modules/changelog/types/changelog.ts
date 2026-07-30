export interface ChangelogEntry {
  id: string;
  projectId: string;
  version: string;
  title: string;
  description: string;
  releasedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChangelogInput {
  projectId: string;
  version: string;
  title: string;
  description: string;
  releasedAt?: string;
}

export interface UpdateChangelogInput {
  id: string;
  projectId: string;
  version?: string;
  title?: string;
  description?: string;
  releasedAt?: string;
}

export interface ChangelogStats {
  totalReleases: number;
  latestVersion: string;
  majorReleases: number;
  lastReleasedAt: string | null;
}
