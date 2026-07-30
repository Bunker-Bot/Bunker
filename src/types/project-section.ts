export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export interface ProjectSection {
  id: string;
  project_id: string;
  title: string;
  slug: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}
