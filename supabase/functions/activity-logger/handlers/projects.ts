import { WebhookPayload, ActivityLogDTO } from '../types.ts';

export const handleProjectEvent = (payload: WebhookPayload): ActivityLogDTO | null => {
  const { type, record, old_record } = payload;
  const target = record || old_record;
  if (!target) return null;

  let action = 'Project Updated';
  if (type === 'INSERT') {
    action = 'Project Created';
  } else if (type === 'DELETE') {
    action = 'Project Deleted';
  }

  const metadata = {
    name: target.name,
    slug: target.slug,
    status: target.status,
  };

  return {
    actor_id: target.created_by || null,
    action,
    entity_type: 'project',
    entity_id: target.id,
    metadata,
  };
};
