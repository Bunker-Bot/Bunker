export type NoteTag =
  | 'Meeting'
  | 'Bug'
  | 'Payment'
  | 'Feature'
  | 'Urgent'
  | 'Backend'
  | 'Frontend'
  | 'Design'
  | 'Deployment'
  | 'Client Preference'
  | 'General';

export interface NoteEntry {
  id: string;
  projectId?: string | null;
  clientId?: string | null;
  title: string;
  content: string;
  tags: NoteTag[];
  isPinned: boolean;
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  projectName?: string;
  clientName?: string;
}

export interface CreateNoteInput {
  projectId?: string | null;
  clientId?: string | null;
  title?: string;
  content: string;
  tags?: NoteTag[];
  isPinned?: boolean;
}

export interface UpdateNoteInput {
  id: string;
  projectId?: string | null;
  clientId?: string | null;
  title?: string;
  content?: string;
  tags?: NoteTag[];
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface NoteFilters {
  projectId?: string | null;
  clientId?: string | null;
  search?: string;
  tag?: NoteTag | 'all';
  isPinnedOnly?: boolean;
  isArchivedOnly?: boolean;
  sortBy?: 'created_at' | 'updated_at' | 'title';
  sortOrder?: 'asc' | 'desc';
}
