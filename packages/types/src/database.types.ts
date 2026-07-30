export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          admin_id: string;
          name: string;
          company_name: string | null;
          email: string;
          avatar_url: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          name: string;
          company_name?: string | null;
          email: string;
          avatar_url?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          name?: string;
          company_name?: string | null;
          email?: string;
          avatar_url?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          admin_id: string;
          client_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          status: string;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          client_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          status?: string;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          client_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          status?: string;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      share_links: {
        Row: {
          id: string;
          project_id: string;
          token: string;
          is_active: boolean;
          expires_at: string | null;
          password_hash: string | null;
          max_views: number | null;
          view_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          token: string;
          is_active?: boolean;
          expires_at?: string | null;
          password_hash?: string | null;
          max_views?: number | null;
          view_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          token?: string;
          is_active?: boolean;
          expires_at?: string | null;
          password_hash?: string | null;
          max_views?: number | null;
          view_count?: number;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          module: string | null;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          status: 'todo' | 'in_progress' | 'review' | 'testing' | 'completed';
          due_date: string | null;
          progress: number;
          labels: string[];
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          module?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'todo' | 'in_progress' | 'review' | 'testing' | 'completed';
          due_date?: string | null;
          progress?: number;
          labels?: string[];
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          module?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'todo' | 'in_progress' | 'review' | 'testing' | 'completed';
          due_date?: string | null;
          progress?: number;
          labels?: string[];
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_attachments: {
        Row: {
          id: string;
          task_id: string;
          file_url: string;
          file_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          file_url: string;
          file_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          file_url?: string;
          file_name?: string;
          created_at?: string;
      };
      documents: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          doc_type: string;
          category: string;
          content: string | null;
          version: number;
          author: string;
          is_client_visible: boolean;
          is_favorite: boolean;
          is_locked: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          doc_type?: string;
          category?: string;
          content?: string | null;
          version?: number;
          author?: string;
          is_client_visible?: boolean;
          is_favorite?: boolean;
          is_locked?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          doc_type?: string;
          category?: string;
          content?: string | null;
          version?: number;
          author?: string;
          is_client_visible?: boolean;
          is_favorite?: boolean;
          is_locked?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_versions: {
        Row: {
          id: string;
          document_id: string;
          content: string;
          version_number: number;
          change_summary: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          content: string;
          version_number: number;
          change_summary?: string;
          created_by?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          content?: string;
          version_number?: number;
          change_summary?: string;
          created_by?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
