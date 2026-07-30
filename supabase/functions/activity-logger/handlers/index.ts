import { EntityHandler } from '../types.ts';
import { handleProjectEvent } from './projects.ts';
import { handleClientEvent } from './clients.ts';
import { handleTaskEvent } from './tasks.ts';

export const HANDLER_REGISTRY: Record<string, EntityHandler> = {
  projects: handleProjectEvent,
  clients: handleClientEvent,
  tasks: handleTaskEvent,
};
