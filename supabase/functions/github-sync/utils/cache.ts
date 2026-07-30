export function isCacheFresh(lastSyncedAtStr?: string | null, cacheTtlMinutes = 5): boolean {
  if (!lastSyncedAtStr) return false;
  const lastSynced = new Date(lastSyncedAtStr).getTime();
  const now = new Date().getTime();
  const diffMinutes = (now - lastSynced) / (1000 * 60);
  return diffMinutes < cacheTtlMinutes;
}
