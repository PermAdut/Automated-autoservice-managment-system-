import { useState, useEffect, useCallback } from "react";
import { serverConfig } from "../configs/serverConfig";
import { replayQueue, getQueueLength } from "../offline/syncQueue";

const PING_INTERVAL = 30_000; // 30 seconds
const HEALTH_URL = `${serverConfig.url}/health`;

export interface NetworkStatus {
  isOnline: boolean;
  queueLength: number;
  lastChecked: Date | null;
}

let pingInterval: ReturnType<typeof setInterval> | null = null;

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueLength, setQueueLength] = useState(0);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const refreshQueueLength = useCallback(async () => {
    const len = await getQueueLength();
    setQueueLength(len);
  }, []);

  const checkConnectivity = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      await refreshQueueLength();
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(HEALTH_URL, { method: "GET", signal: controller.signal, cache: "no-store" });
      clearTimeout(timeout);
      const online = res.ok;

      if (online && !isOnline) {
        // Came back online — replay queue
        await replayQueue();
      }

      setIsOnline(online);
      setLastChecked(new Date());
    } catch {
      setIsOnline(false);
    }

    await refreshQueueLength();
  }, [isOnline, refreshQueueLength]);

  useEffect(() => {
    void checkConnectivity();

    const onOnline = () => void checkConnectivity();
    const onOffline = () => { setIsOnline(false); void refreshQueueLength(); };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    if (!pingInterval) {
      pingInterval = setInterval(() => void checkConnectivity(), PING_INTERVAL);
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [checkConnectivity, refreshQueueLength]);

  useEffect(() => {
    void refreshQueueLength();
  });

  return { isOnline, queueLength, lastChecked };
}
