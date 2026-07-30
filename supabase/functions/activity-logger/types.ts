export interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: Record<string, any> | null;
  old_record: Record<string, any> | null;
  timestamp?: string;
}

export interface ActivityLogDTO {
  actor_id?: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  created_at?: string;
}

export type EntityHandler = (payload: WebhookPayload) => ActivityLogDTO | null;
