import "server-only";

let lastSyncAt: string | null = null;
let lastSyncAction: string | null = null;
let lastSyncRecords = 0;

export function recordSync(action: string, recordsAffected: number): void {
  lastSyncAt = new Date().toISOString();
  lastSyncAction = action;
  lastSyncRecords = recordsAffected;
}

export function getSyncMeta() {
  return {
    lastSyncAt,
    lastSyncAction,
    lastSyncRecords,
  };
}
