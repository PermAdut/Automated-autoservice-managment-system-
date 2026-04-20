import { openDB, type IDBPDatabase } from "idb";

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
        success++;
      } else if (res.status >= 400 && res.status < 500) {
        // Client error — remove permanently
        await removeFromQueue(item.id);
        failed++;
      } else {
        await incrementRetry(item.id);
        failed++;
      }
    } catch {
      await incrementRetry(item.id);
      failed++;
    }
  }

  return { success, failed };
}
