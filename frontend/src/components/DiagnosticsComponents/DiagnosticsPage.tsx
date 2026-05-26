import { useState } from "react";
import { useGetMyVehiclesQuery } from "../../api/vehiclesApi";
import {
  useGetSessionsByCarQuery,
  useGetRemindersQuery,
  useCompleteReminderMutation,
  useCreateSessionMutation,
  type DiagnosticSession,
  type MaintenanceReminder,
} from "../../api/diagnosticsApi";
import { PageLayout } from "../layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { serverConfig } from "../../configs/serverConfig";
import { cn } from "../../lib/utils";

const reminderTypeLabels: Record<string, string> = {
  oil_change: "Замена масла",
  tire_rotation: "Ротация шин",
  brake_service: "Тормоза",
  scheduled_maintenance: "Плановое ТО",
  timing_belt: "Ремень ГРМ",
  other: "Другое",
};

function ReminderCard({ reminder, onComplete }: { reminder: MaintenanceReminder; onComplete: (id: string) => void }) {
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    await onComplete(reminder.id);
    setCompleting(false);
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-lg border",
      reminder.isCompleted ? "bg-gray-50 border-gray-200 opacity-60" : "bg-amber-50 border-amber-200",
    )}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900">{reminderTypeLabels[reminder.type] ?? reminder.type}</span>
          {reminder.isCompleted && <Badge variant="success">Выполнено</Badge>}
          {!reminder.isCompleted && <Badge variant="warning">Ожидает</Badge>}
        </div>
        {reminder.description && <p className="text-sm text-gray-600">{reminder.description}</p>}
        <div className="flex gap-4 mt-1 text-xs text-gray-500">
          {reminder.dueDate && <span>До: {new Date(reminder.dueDate).toLocaleDateString("ru-RU")}</span>}
          {reminder.dueMileage && <span>До: {reminder.dueMileage.toLocaleString()} км</span>}
        </div>
      </div>
      {!reminder.isCompleted && (
        <Button size="sm" variant="outline" onClick={handleComplete} disabled={completing}>
          {completing ? "..." : "Выполнено"}
        </Button>
      )}
    </div>
  );
}

function SessionCard({ session }: { session: DiagnosticSession }) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-gray-900">
            Диагностика от {new Date(session.createdAt).toLocaleDateString("ru-RU")}
          </p>
          {session.mileage && (
            <p className="text-sm text-gray-500 mt-0.5">Пробег: {session.mileage.toLocaleString()} км</p>
          )}
          {session.notes && <p className="text-sm text-gray-600 mt-1">{session.notes}</p>}
          {session.photoUrls && session.photoUrls.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {session.photoUrls.map((url) => (
                <a key={url} href={url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 underline">
                  Фото
                </a>
              ))}
            </div>
          )}
          <a
            href={`${serverConfig.url}/api/v1.0/diagnostics/sessions/${session.id}/pdf`}
            className="text-xs text-indigo-600 hover:underline mt-2 inline-block"
            target="_blank"
            rel="noreferrer"
          >
            Скачать PDF
          </a>
        </div>
      </div>
    </div>
  );
}

function CarDiagnostics({ carId }: { carId: string }) {
  const { data: sessions = [], isLoading: sessionsLoading } = useGetSessionsByCarQuery(carId);
  const { data: reminders = [], isLoading: remindersLoading } = useGetRemindersQuery({ carId });
  const [completeReminder] = useCompleteReminderMutation();
  const [showNewSession, setShowNewSession] = useState(false);
  const [createSession] = useCreateSessionMutation();
  const [notes, setNotes] = useState("");
  const [mileage, setMileage] = useState("");

  const handleCreateSession = async () => {
    await createSession({ carId, notes: notes || undefined, mileage: mileage ? Number(mileage) : undefined });
    setShowNewSession(false);
    setNotes("");
    setMileage("");
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Напоминания о ТО</h3>
        </div>
        {remindersLoading ? (
          <div className="animate-pulse h-16 bg-gray-100 rounded-lg" />
        ) : reminders.length === 0 ? (
          <p className="text-sm text-gray-400 py-3 text-center">Нет напоминаний</p>
        ) : (
          <div className="space-y-2">
            {reminders.map(r => (
              <ReminderCard key={r.id} reminder={r} onComplete={(id) => completeReminder(id)} />
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">История диагностик</h3>
          <Button size="sm" variant="outline" onClick={() => setShowNewSession(!showNewSession)}>
            + Добавить
          </Button>
        </div>

        {showNewSession && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Пробег (км)</label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm"
                  value={mileage}
                  onChange={e => setMileage(e.target.value)}
                  placeholder="100000"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Заметки</label>
              <textarea
                className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm resize-none"
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Результаты диагностики..."
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateSession}>Сохранить</Button>
              <Button size="sm" variant="outline" onClick={() => setShowNewSession(false)}>Отмена</Button>
            </div>
          </div>
        )}

        {sessionsLoading ? (
          <div className="animate-pulse h-16 bg-gray-100 rounded-lg" />
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-400 py-3 text-center">Нет сессий диагностики</p>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DiagnosticsPage() {
  const { data: vehicles = [], isLoading: vehiclesLoading } = useGetMyVehiclesQuery();
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  const selectedCar = vehicles.find(v => v.id === selectedCarId);

  return (
    <PageLayout className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Диагностика и ТО</h1>
        <p className="text-gray-500 text-sm mt-0.5">История диагностик и напоминания о техническом обслуживании</p>
      </div>

      {vehiclesLoading ? (
        <div className="flex gap-3">{[1, 2].map(i => <div key={i} className="animate-pulse h-12 w-40 bg-gray-200 rounded-xl" />)}</div>
      ) : vehicles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-3xl mb-3">🔧</p>
            <p className="text-gray-500">Добавьте автомобиль, чтобы видеть диагностику</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {vehicles.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedCarId(v.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                  selectedCarId === v.id
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300",
                )}
              >
                {v.brand} {v.model} ({v.year})
              </button>
            ))}
          </div>

          {selectedCar ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedCar.brand} {selectedCar.model} · {selectedCar.year}</CardTitle>
              </CardHeader>
              <CardContent>
                <CarDiagnostics carId={selectedCar.id} />
              </CardContent>
            </Card>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">Выберите автомобиль для просмотра диагностики</p>
          )}
        </>
      )}
    </PageLayout>
  );
}
