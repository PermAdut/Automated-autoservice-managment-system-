import { useState } from "react";
import {
  useGetGanttDataQuery,
  useOptimizeScheduleMutation,
  useReassignOrderMutation,
  type ScheduleSlot,
} from "../../api/scheduleApi";
import { PageLayout } from "../layout/PageLayout";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 border-yellow-300 text-yellow-800",
  created:    "bg-blue-100  border-blue-300  text-blue-800",
  in_progress:"bg-indigo-100 border-indigo-300 text-indigo-800",
  completed:  "bg-green-100 border-green-300 text-green-800",
  cancelled:  "bg-gray-100  border-gray-300  text-gray-500",
  urgent:     "bg-red-100   border-red-300   text-red-800",
};

function parseTime(iso: string) {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}

function formatTime(h: number) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 – 20:00
const DAY_START = 8;
const DAY_END = 21;
const TOTAL_HOURS = DAY_END - DAY_START;

interface DragState {
  slotOrderId: string;
  sourceEmployeeId: string;
}

function GanttSlot({ slot, onDragStart }: { slot: ScheduleSlot; onDragStart: () => void }) {
  const start = parseTime(slot.startAt);
  const end = parseTime(slot.endAt);
  const leftPct = ((start - DAY_START) / TOTAL_HOURS) * 100;
  const widthPct = Math.max(((end - start) / TOTAL_HOURS) * 100, 2);
  const colorClass = STATUS_COLORS[slot.status] ?? STATUS_COLORS.pending;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
      className={cn(
        "absolute top-1 bottom-1 rounded-lg border text-xs px-2 py-1 cursor-grab overflow-hidden select-none z-10",
        "flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow",
        colorClass,
      )}
      title={slot.serviceNames.join(", ") || `Заказ #${slot.orderId.slice(0, 6)}`}
    >
      <span className="font-medium truncate">{slot.serviceNames[0] ?? `Заказ`}</span>
      <span className="opacity-70">{formatTime(start)} – {formatTime(end)}</span>
    </div>
  );
}

export default function SchedulePage() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const { data: ganttRows = [], isLoading, refetch } = useGetGanttDataQuery(date);
  const [optimize, { isLoading: isOptimizing }] = useOptimizeScheduleMutation();
  const [reassign] = useReassignOrderMutation();
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [lastResult, setLastResult] = useState<{ assignments: number; unscheduled: number } | null>(null);

  const handleOptimize = async () => {
    const result = await optimize({ windowHours: 8 }).unwrap();
    setLastResult({ assignments: result.assignments.length, unscheduled: result.unscheduled.length });
    refetch();
  };

  const handleDrop = async (targetEmployeeId: string) => {
    if (!dragState || dragState.sourceEmployeeId === targetEmployeeId) {
      setDragState(null);
      return;
    }
    await reassign({ orderId: dragState.slotOrderId, employeeId: targetEmployeeId });
    setDragState(null);
    refetch();
  };

  const totalSlots = ganttRows.reduce((sum, r) => sum + r.slots.length, 0);

  return (
    <PageLayout className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Расписание</h1>
          <p className="text-gray-500 text-sm mt-0.5">Диаграмма Ганта — загрузка мастеров</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          />
          <Button onClick={handleOptimize} disabled={isOptimizing} variant="default">
            {isOptimizing ? "Оптимизирую..." : "⚡ Оптимизировать"}
          </Button>
        </div>
      </div>

      {lastResult && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
          <span>✅ Назначено: {lastResult.assignments}, не удалось: {lastResult.unscheduled}</span>
          <button className="text-green-500 hover:text-green-700" onClick={() => setLastResult(null)}>✕</button>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs flex-wrap">
        {Object.entries(STATUS_COLORS).map(([status, cls]) => (
          <span key={status} className={cn("px-2 py-0.5 rounded border", cls)}>
            {status === "pending" ? "Ожидает" : status === "in_progress" ? "В работе" : status === "completed" ? "Завершён" : status === "urgent" ? "Срочный" : status}
          </span>
        ))}
        <span className="text-gray-400">Перетаскивайте карточки для переназначения</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-xl" />)}</div>
      ) : ganttRows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-gray-500">Нет сотрудников или заказов за выбранную дату</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Time axis */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <div className="w-40 shrink-0 px-4 py-2 text-xs font-medium text-gray-500">Мастер</div>
              <div className="flex-1 relative">
                <div className="flex">
                  {HOURS.map(h => (
                    <div key={h} className="flex-1 px-1 py-2 text-xs text-gray-400 text-center border-l border-gray-200 first:border-0">
                      {h}:00
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {ganttRows.map((row) => (
              <div
                key={row.employeeId}
                className={cn(
                  "flex border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors",
                  dragState && dragState.sourceEmployeeId !== row.employeeId && "bg-blue-50/30",
                )}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(row.employeeId)}
              >
                {/* Employee label */}
                <div className="w-40 shrink-0 px-4 py-3 flex items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate">{row.employeeName}</p>
                    <p className="text-xs text-gray-400">{row.slots.length} заказов</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex-1 relative min-h-[52px]">
                  {/* Hour grid lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {HOURS.map(h => (
                      <div key={h} className="flex-1 border-l border-gray-100 first:border-0" />
                    ))}
                  </div>

                  {row.slots.map(slot => (
                    <GanttSlot
                      key={slot.orderId}
                      slot={slot}
                      onDragStart={() => setDragState({ slotOrderId: slot.orderId, sourceEmployeeId: row.employeeId })}
                    />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-gray-400 text-center">
        Всего заказов на {new Date(date).toLocaleDateString("ru-RU")}: {totalSlots}
      </p>
    </PageLayout>
  );
}
