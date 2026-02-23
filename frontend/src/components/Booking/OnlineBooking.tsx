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
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import { cn } from "../../lib/utils";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const statusConfig: Record<string, { label: string; variant: "info" | "purple" | "warning" | "success" | "destructive" | "secondary" }> = {
  scheduled: { label: "Запланирована", variant: "info" },
  confirmed: { label: "Подтверждена", variant: "purple" },
  in_progress: { label: "В работе", variant: "warning" },
  completed: { label: "Завершена", variant: "success" },
  cancelled: { label: "Отменена", variant: "destructive" },
  no_show: { label: "Не явился", variant: "secondary" },
};

export default function OnlineBooking() {
  const [tab, setTab] = useState<"new" | "my">("new");
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
      // handled by RTK Query
    }
  };

  const handleCancel = async (id: string) => {
    await cancelAppointment(id);
    refetchMy();
  };

  const freeSlots = slots?.filter((s) => !s.isBooked) ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-5 px-4 py-6 pb-20">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          <CalendarOutlined className="text-base" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Онлайн-запись</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
        {(["new", "my"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer border-none",
              tab === t
                ? "bg-white text-indigo-700 shadow-sm font-semibold"
                : "text-gray-500 bg-transparent hover:text-gray-700"
            )}
          >
            {t === "new" ? "Новая запись" : "Мои записи"}
            {t === "my" && myAppointments?.length ? (
              <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
                {myAppointments.length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* New Booking */}
      {tab === "new" && (
        <Card>
          <CardContent className="pt-6 space-y-5">
            {successCode && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircleOutlined className="text-green-600" />
                  <p className="text-green-800 font-semibold">Запись создана!</p>
                </div>
                <p className="text-green-700 text-sm">
                  Код подтверждения:{" "}
                  <span className="font-mono font-bold text-xl tracking-widest text-green-900">
                    {successCode}
                  </span>
                </p>
                <p className="text-green-600 text-xs mt-1">
                  Сохраните этот код — он потребуется при визите.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-green-700"
                  onClick={() => setSuccessCode(null)}
                >
                  Создать ещё одну запись
                </Button>
              </div>
            )}

            {/* Master */}
            <div className="space-y-1.5">
              <Label>
                <UserOutlined className="mr-1.5" />
                Мастер
              </Label>
              <Select
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
                    {e.position?.name ? ` · ${e.position.name}` : ""}
                  </option>
                ))}
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label>
                <CalendarOutlined className="mr-1.5" />
                Дата
              </Label>
              <input
                type="date"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot("");
                }}
              />
            </div>

            {/* Time Slots */}
            {selectedEmployee && (
              <div className="space-y-2">
                <Label>
                  <ClockCircleOutlined className="mr-1.5" />
                  Свободное время
                </Label>
                {slotsLoading ? (
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : freeSlots.length ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {freeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot.id)}
                        className={cn(
                          "py-2 px-1 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer",
                          selectedSlot === slot.id
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50"
                        )}
                      >
                        {slot.startTime.slice(0, 5)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl">
                    <ClockCircleOutlined className="text-2xl mb-1.5 block" />
                    <p className="text-sm">Нет свободных слотов на эту дату</p>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>
                <MessageOutlined className="mr-1.5" />
                Комментарий{" "}
                <span className="text-gray-400 font-normal">(необязательно)</span>
              </Label>
              <textarea
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none"
                rows={3}
                placeholder="Опишите проблему или пожелания..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleCreate}
              disabled={!selectedSlot || creating}
            >
              {creating ? "Создание записи..." : "Записаться"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* My Appointments */}
      {tab === "my" && (
        <div className="space-y-3">
          {myAppointments?.length ? (
            myAppointments.map((appt) => {
              const cfg = statusConfig[appt.status];
              return (
                <Card key={appt.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={cfg?.variant ?? "secondary"}>
                            {cfg?.label ?? appt.status}
                          </Badge>
                          <span className="text-xs text-gray-400 font-mono">
                            #{appt.confirmationCode}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(appt.scheduledAt).toLocaleString("ru-RU", {
                            dateStyle: "long",
                            timeStyle: "short",
                          })}
                        </p>
                        {appt.notes && (
                          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1">
                            {appt.notes}
                          </p>
                        )}
                      </div>
                      {["scheduled", "confirmed"].includes(appt.status) && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                          onClick={() => handleCancel(appt.id)}
                        >
                          <CloseOutlined />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-16 text-gray-400">
              <CalendarOutlined className="text-4xl mb-3 block" />
              <p className="text-sm mb-3">У вас нет записей</p>
              <Button variant="outline" onClick={() => setTab("new")}>
                Записаться
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
