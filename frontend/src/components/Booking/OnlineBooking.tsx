import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  useGetAvailableSlotsQuery,
  useCreateAppointmentMutation,
  useGetMyAppointmentsQuery,
  useCancelAppointmentMutation,
} from "../../api/bookingApi";
import { useGetEmployeesQuery } from "../../api/employeesApi";

const statusLabels: Record<string, string> = {
  scheduled: "Запланирована",
  confirmed: "Подтверждена",
  in_progress: "В работе",
  completed: "Завершена",
  cancelled: "Отменена",
  no_show: "Не явился",
};

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-gray-100 text-gray-600",
};

export default function OnlineBooking() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [tab, setTab] = useState<"new" | "my">("new");

  // New booking form state
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const { data: employees } = useGetEmployeesQuery({});
  const { data: slots, isLoading: slotsLoading } = useGetAvailableSlotsQuery(
    { employeeId: selectedEmployee, date: selectedDate },
    { skip: !selectedEmployee || !selectedDate }
  );
  const { data: myAppointments, refetch: refetchMy } = useGetMyAppointmentsQuery();
  const [createAppointment, { isLoading: creating }] = useCreateAppointmentMutation();
  const [cancelAppointment] = useCancelAppointmentMutation();

  const handleCreate = async () => {
    if (!selectedSlot) return;
    const slot = slots?.find((s) => s.id === selectedSlot);
    if (!slot) return;

    try {
      const result = await createAppointment({
        timeSlotId: selectedSlot,
        scheduledAt: `${selectedDate}T${slot.startTime}`,
        notes: notes || undefined,
      }).unwrap();
      setSuccessCode(result.confirmationCode);
      setSelectedSlot("");
      setNotes("");
      refetchMy();
    } catch {
      // error handled by RTK Query
    }
  };

  const handleCancel = async (id: string) => {
    await cancelAppointment(id);
    refetchMy();
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Онлайн-запись</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(["new", "my"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "new" ? "Новая запись" : "Мои записи"}
          </button>
        ))}
      </div>

      {/* New Booking */}
      {tab === "new" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          {successCode && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">Запись создана!</p>
              <p className="text-green-700 text-sm mt-1">
                Код подтверждения:{" "}
                <span className="font-mono font-bold text-lg tracking-widest">
                  {successCode}
                </span>
              </p>
              <p className="text-green-600 text-xs mt-1">
                Сохраните этот код — он потребуется при визите.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Выберите мастера *
            </label>
            <select
              className={inputClass}
              value={selectedEmployee}
              onChange={(e) => {
                setSelectedEmployee(e.target.value);
                setSelectedSlot("");
              }}
            >
              <option value="">— Любой мастер —</option>
              {employees?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} {e.surName}
                  {e.position?.name ? ` (${e.position.name})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата *
            </label>
            <input
              type="date"
              className={inputClass}
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot("");
              }}
            />
          </div>

          {selectedEmployee && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Доступное время
              </label>
              {slotsLoading ? (
                <p className="text-gray-400 text-sm">Загрузка слотов...</p>
              ) : slots?.length ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots
                    .filter((s) => !s.isBooked)
                    .map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                          selectedSlot === slot.id
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Нет свободных слотов на эту дату</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Комментарий (необязательно)
            </label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Опишите проблему или пожелания..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={!selectedSlot || creating}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? "Создание записи..." : "Записаться"}
          </button>
        </div>
      )}

      {/* My appointments */}
      {tab === "my" && (
        <div className="space-y-3">
          {myAppointments?.length ? (
            myAppointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        statusColors[appt.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {statusLabels[appt.status] ?? appt.status}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      #{appt.confirmationCode}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(appt.scheduledAt).toLocaleString("ru-RU", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                  {appt.notes && (
                    <p className="text-xs text-gray-500">{appt.notes}</p>
                  )}
                </div>
                {["scheduled", "confirmed"].includes(appt.status) && (
                  <button
                    onClick={() => handleCancel(appt.id)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium shrink-0"
                  >
                    Отменить
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-400">У вас нет записей</p>
              <button
                onClick={() => setTab("new")}
                className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Записаться →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
