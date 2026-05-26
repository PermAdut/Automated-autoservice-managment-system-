import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { replayQueue } from "../../offline/syncQueue";
import { useGetSyncLogQuery } from "../../api/syncApi";
import { useState } from "react";
import { ModalOverlay } from "../ui/modal-overlay";

export function OfflineStatusBar() {
  const { isOnline, queueLength } = useNetworkStatus();
  const [replaying, setReplaying] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const { data: syncLog = [], refetch } = useGetSyncLogQuery(50, {
    skip: !showLog,
  });

  if (isOnline && queueLength === 0 && !showLog) return null;

  const handleReplay = async () => {
    setReplaying(true);
    await replayQueue();
    setReplaying(false);
    if (showLog) void refetch();
  };

  return (
    <>
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLog(true)}
            className="px-3 py-0.5 text-xs bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            Журнал
          </button>
          {isOnline && queueLength > 0 && (
            <button
              type="button"
              onClick={handleReplay}
              disabled={replaying}
              className="px-3 py-0.5 text-xs bg-white/20 rounded-lg hover:bg-white/30 disabled:opacity-50 transition-colors"
            >
              {replaying ? "Синхронизация..." : "Синхронизировать"}
            </button>
          )}
        </div>
      </div>

      {showLog && (
        <ModalOverlay zIndex="high" onClick={() => setShowLog(false)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Журнал синхронизации</h3>
              <button
                type="button"
                onClick={() => setShowLog(false)}
                className="text-gray-500 hover:text-gray-700 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {syncLog.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Записей пока нет
                </p>
              ) : (
                syncLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="text-sm border rounded-lg p-3 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">
                        {entry.operation} · {entry.entity}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          entry.status === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.syncedAt).toLocaleString("ru-RU")}
                    </span>
                    {entry.error && (
                      <span className="text-xs text-red-600">{entry.error}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </ModalOverlay>
      )}
    </>
  );
}
