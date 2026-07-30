import { WebhookPayload, ActivityLogDTO } from '../types.ts';

export const handleTaskEvent = (payload: WebhookPayload): ActivityLogDTO | null => {
  const { type, record, old_record } = payload;
  const target = record || old_record;
  if (!target) return null;

  let action = 'Task Updated';
  if (type === 'INSERT') {
    action = 'Task Created';
  } else if (type === 'DELETE') {
    action = 'Task Deleted';
  } else if (type === 'UPDATE' && record?.status === 'completed' && old_record?.status !== 'completed') {
    action = 'Task Completed';
  }

  const metadata = {
    title: target.title || target.name,
    status: target.status,
    priority: target.priority,
  };

  return {
    actor_id: target.assigned_to || target.created_by || null,
    action,
    entity_type: 'task',
    entity_id: target.id,
    metadata,
  };
};
