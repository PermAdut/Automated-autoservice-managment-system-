import { openDB, type IDBPDatabase } from "idb";
import { serverConfig } from "../configs/serverConfig";

const DB_NAME = "autoservice_offline";
const DB_VERSION = 1;
const STORE_NAME = "sync_queue";

export interface SyncQueueItem {
  id: string;
  method: "POST" | "PATCH" | "PUT" | "DELETE";
  url: string;
  body?: unknown;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

let db: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (db) return db;
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
  return db;
}

export async function enqueue(item: Omit<SyncQueueItem, "id" | "timestamp" | "retries">): Promise<void> {
  const database = await getDb();
  await database.put(STORE_NAME, {
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retries: 0,
  } satisfies SyncQueueItem);
}

export async function getQueue(): Promise<SyncQueueItem[]> {
  const database = await getDb();
  return database.getAll(STORE_NAME);
}

export async function removeFromQueue(id: string): Promise<void> {
  const database = await getDb();
  await database.delete(STORE_NAME, id);
}

export async function incrementRetry(id: string): Promise<void> {
  const database = await getDb();
  const item = await database.get(STORE_NAME, id);
  if (item) {
    item.retries += 1;
    if (item.retries >= item.maxRetries) {
      await database.delete(STORE_NAME, id);
    } else {
      await database.put(STORE_NAME, item);
    }
  }
}

export async function getQueueLength(): Promise<number> {
  const database = await getDb();
  return database.count(STORE_NAME);
}

/**
 * Replay all queued requests when the network is restored.
 * Each request is attempted in timestamp order.
 */
async function logSyncResult(
  item: SyncQueueItem,
  status: "success" | "error",
  error?: string,
): Promise<void> {
  const token = localStorage.getItem("access_token");
  if (!token) return;

  const pathParts = item.url.split("/api/v1.0/")[1]?.split("/") ?? [];
  const entity = pathParts[0] ?? "unknown";
  const entityId =
    (typeof item.body === "object" &&
      item.body !== null &&
      "id" in item.body &&
      typeof (item.body as { id: unknown }).id === "string"
      ? (item.body as { id: string }).id
      : crypto.randomUUID());

  try {
    await fetch(`${serverConfig.url}/api/v1.0/sync/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        operation: item.method,
        entity,
        entityId,
        status,
        error,
      }),
    });
  } catch {
    // sync log is best-effort
  }
}

export async function replayQueue(): Promise<{ success: number; failed: number }> {
  const items = await getQueue();
  items.sort((a, b) => a.timestamp - b.timestamp);

  let success = 0;
  let failed = 0;

  const token = localStorage.getItem("access_token");
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: { ...defaultHeaders, ...(item.headers ?? {}) },
        body: item.body ? JSON.stringify(item.body) : undefined,
      });

      if (res.ok) {
        await removeFromQueue(item.id);
        await logSyncResult(item, "success");
        success++;
      } else if (res.status >= 400 && res.status < 500) {
        await removeFromQueue(item.id);
        await logSyncResult(item, "error", `HTTP ${res.status}`);
        failed++;
      } else {
        await incrementRetry(item.id);
        await logSyncResult(item, "error", `HTTP ${res.status}`);
        failed++;
      }
    } catch (err) {
      await incrementRetry(item.id);
      await logSyncResult(
        item,
        "error",
        err instanceof Error ? err.message : "Network error",
      );
      failed++;
    }
  }

  return { success, failed };
}
