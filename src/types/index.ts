export type ViewMode = 
  | 'dashboard'
  | 'projects'
  | 'clients'
  | 'avatar-studio'
  | 'tasks'
  | 'milestones'
  | 'github'
  | 'docs'
  | 'files'
  | 'timeline'
  | 'client_portal'
  | 'share-links'
  | 'payments'
  | 'changelog'
  | 'notes'
  | 'deployments'
  | 'notifications'
  | 'settings';


export type ProjectStatus = 'in_progress' | 'review' | 'completed' | 'on_hold' | 'planning';

export interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  techStack: string[];
  status: ProjectStatus;
  progress: number;
  budget: number;
  spent: number;
  dueDate: string;
  githubRepo: string;
  priority: 'high' | 'medium' | 'low';
  membersCount: number;
}

export interface GitHubRepo {
  id: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  openPRs: number;
  defaultBranch: string;
  commitsCount: number;
  updatedAt: string;
  language: string;
}

export interface Commit {
  id: string;
  hash: string;
  message: string;
  author: string;
  avatar: string;
  date?: string;
  branch: string;
  repoName?: string;
  timestamp?: string;
}

export interface PullRequest {
  id: string;
  number?: number;
  title: string;
  author: string;
  avatar?: string;
  status: 'open' | 'merged' | 'closed';
  branch: string;
  createdAt?: string;
  commentsCount: number;
  additions?: number;
  deletions?: number;
  repoName?: string;
}

export interface MilestoneDeliverable {
  id: string;
  name: string;
  type?: string;
  status: 'completed' | 'in_progress' | 'pending';
  url?: string;
}

export interface MilestoneAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: string;
  uploaded_at?: string;
}

export interface MilestoneDependency {
  id: string;
  name: string;
  status?: string;
}

export interface Milestone {
  id: string;
  project_id?: string;
  name: string;
  title?: string;
  description?: string;
  notes?: string;
  status: 'planned' | 'in_progress' | 'blocked' | 'completed' | 'cancelled' | 'pending' | 'overdue';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  start_date?: string;
  startDate?: string;
  due_date?: string;
  dueDate?: string;
  completion_date?: string;
  completionDate?: string;
  sort_order?: number;
  owner_id?: string;
  owner_name?: string;
  ownerName?: string;
  labels?: string[];
  version?: string;
  sprint?: string;
  tasks_count?: number;
  tasksCount?: number;
  completed_tasks_count?: number;
  completedTasksCount?: number;
  deliverables?: MilestoneDeliverable[];
  dependencies?: (string | MilestoneDependency)[];
  attachments?: MilestoneAttachment[];
  created_at?: string;
  updated_at?: string;
  projectName?: string;
  phase?: string;
}

export interface DocPage {
  id: string;
  title: string;
  category: string;
  updatedAt?: string;
  author: string;
  readTime?: string;
  tags: string[];
  content?: string;
  isPublic?: boolean;
  lastEdited?: string;
}

export interface AssetFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  url?: string;
  category: 'code' | 'design' | 'doc' | 'archive' | 'contracts' | 'designs' | 'credentials';
  isSecret?: boolean;
  secretValue?: string;
  secureUrl?: string;
}

export interface ClientPortal {
  id: string;
  clientName: string;
  projectName?: string;
  activeToken?: string;
  lastActive: string;
  status?: 'active' | 'expired' | 'revoked';
  company?: string;
  avatarUrl?: string;
  satisfactionRating?: number;
  activeProjectsCount?: number;
  unpaidInvoicesTotal?: number;
  email?: string;
}

export interface Invoice {
  id: string;
  number?: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  clientName?: string;
  projectName?: string;
  issuedDate?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp?: string;
  time?: string;
  read: boolean;
  type: 'project' | 'task' | 'billing' | 'system' | 'commit' | 'invoice' | 'approval';
}
