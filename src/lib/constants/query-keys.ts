import { type ProjectQueryOptions } from '../repositories/project.repository';

export const githubKeys = {
  all: ['github'] as const,
  project: (projectId: string) => [...githubKeys.all, 'project', projectId] as const,
  summary: (projectId: string) => [...githubKeys.all, 'summary', projectId] as const,
  sync: (projectId: string) => [...githubKeys.all, 'sync', projectId] as const,
  activity: (projectId: string) => [...githubKeys.all, 'activity', projectId] as const,
  validate: (owner: string, repo: string) => [...githubKeys.all, 'validate', owner, repo] as const,
};

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: ProjectQueryOptions) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (slug: string) => [...projectKeys.details(), slug] as const,
  sections: (id: string) => [...projectKeys.all, 'sections', id] as const,
  overview: (id: string) => [...projectKeys.all, 'overview', id] as const,
  statistics: () => [...projectKeys.all, 'statistics'] as const,
  counts: () => [...projectKeys.all, 'counts'] as const,
  clientsSelect: () => ['clients', 'select-options'] as const,
};

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: any) => [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

export const timelineKeys = {
  all: ['timeline'] as const,
  project: (projectId: string) => [...timelineKeys.all, 'project', projectId] as const,
  infinite: (projectId: string) => [...timelineKeys.project(projectId), 'infinite'] as const,
  search: (projectId: string, query: string) => [...timelineKeys.project(projectId), 'search', query] as const,
  filters: (projectId: string, category: string, dateFrom?: string | null, dateTo?: string | null) =>
    [...timelineKeys.project(projectId), 'filters', { category, dateFrom, dateTo }] as const,
};

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: any) => [...taskKeys.lists(), filters] as const,
  statistics: (projectId?: string) => [...taskKeys.all, 'statistics', projectId || 'all'] as const,
  modules: (projectId?: string) => [...taskKeys.all, 'modules', projectId || 'all'] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
};
