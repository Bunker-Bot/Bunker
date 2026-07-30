import { WebhookPayload, ActivityLogDTO } from '../types.ts';

export const handleClientEvent = (payload: WebhookPayload): ActivityLogDTO | null => {
  const { type, record, old_record } = payload;
  const target = record || old_record;
  if (!target) return null;

  let action = 'Client Updated';
  if (type === 'INSERT') {
    action = 'Client Created';
  } else if (type === 'DELETE') {
    action = 'Client Deleted';
  }

  const metadata = {
    name: target.name,
    company: target.company,
  };

  return {
    actor_id: target.created_by || null,
    action,
    entity_type: 'client',
    entity_id: target.id,
    metadata,
  };
};
