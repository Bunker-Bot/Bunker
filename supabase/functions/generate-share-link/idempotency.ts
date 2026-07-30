import type { GenerateShareLinkResponseSuccess } from './types.ts';

interface IdempotencyRecord {
  response: GenerateShareLinkResponseSuccess;
  createdAt: number;
}

const idempotencyStore = new Map<string, IdempotencyRecord>();
const TTL_MS = 1000 * 60 * 15; // 15 minutes TTL

export function getIdempotentResponse(key: string): GenerateShareLinkResponseSuccess | null {
  const record = idempotencyStore.get(key);
  if (!record) return null;
  if (Date.now() - record.createdAt > TTL_MS) {
    idempotencyStore.delete(key);
    return null;
  }
  return record.response;
}

export function setIdempotentResponse(key: string, response: GenerateShareLinkResponseSuccess): void {
  idempotencyStore.set(key, { response, createdAt: Date.now() });
}
