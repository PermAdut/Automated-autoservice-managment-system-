import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { replayQueue } from "../../offline/syncQueue";
import { useState } from "react";

export function OfflineStatusBar() {
  const { isOnline, queueLength } = useNetworkStatus();
  const [replaying, setReplaying] = useState(false);

  if (isOnline && queueLength === 0) return null;

  const handleReplay = async () => {
    setReplaying(true);
    await replayQueue();
    setReplaying(false);
  };

  return (
    <div
      className={`w-full px-4 py-2 text-sm font-medium flex items-center justify-between gap-3 ${
        isOnline ? "bg-amber-500 text-white" : "bg-red-600 text-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <span>{isOnline ? "🟡" : "🔴"}</span>
        <span>
          {isOnline
            ? queueLength > 0
              ? `Синхронизация... ${queueLength} операций в очереди`
              : "Соединение восстановлено"
            : `Нет подключения${queueLength > 0 ? ` · ${queueLength} ${queueLength === 1 ? "операция" : queueLength < 5 ? "операции" : "операций"} ожидают` : ""}`}
        </span>
      </div>

      {isOnline && queueLength > 0 && (
        <button
          onClick={handleReplay}
          disabled={replaying}
          className="px-3 py-0.5 text-xs bg-white/20 rounded-lg hover:bg-white/30 disabled:opacity-50 transition-colors"
        >
          {replaying ? "Синхронизация..." : "Синхронизировать"}
        </button>
      )}
    </div>
  );
}
