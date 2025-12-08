import React from "react";
import "./EmployeeItem.css";

interface EmployeeItemProps {
  id: number;
  name: string;
  surName: string;
  lastName?: string | null;
  position: { id: number; name: string; description?: string };
  orders?: { id: number; status: string };
  schedule?: { startTime: string; endTime: string; isAvailable: boolean };
  hireDate: string;
  salary: number;
}

const formatScheduleTime = (timeString?: string) => {
  if (!timeString) return "Не указано";
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return "Не указано";

  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;
  if (isWeekend) return "Выходной";

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const EmployeeItem: React.FC<EmployeeItemProps> = ({
  id,
  name,
  surName,
  lastName,
  position,
  orders,
  schedule,
  hireDate,
  salary,
}) => {
  return (
    <div className="employee-item-card">
      <div className="employee-item-header">
        <h2 className="employee-item-name">
          {surName} {name} {lastName ?? ""}
        </h2>
        <p className="employee-item-info">
          ID: {id} · Должность: {position.name}
        </p>
      </div>

      <div className="employee-item-details">
        <p>
          <strong>Описание должности:</strong>{" "}
          {position.description || "Нет описания"}
        </p>
        <p>
          <strong>Зарплата:</strong> {salary} руб.
        </p>
        <p>
          <strong>Дата найма:</strong> {new Date(hireDate).toLocaleDateString()}
        </p>
      </div>

      <div className="employee-item-section">
        <h3>Текущий заказ</h3>
        <p>
          <strong>ID заказа:</strong> {orders?.id ?? "Нет заказа"}
        </p>
        <p>
          <strong>Статус:</strong> {orders?.status ?? "Нет заказа"}
        </p>
      </div>

      <div className="employee-item-section">
        <h3>Расписание</h3>
        <p>
          <strong>Начало работы:</strong>{" "}
          {formatScheduleTime(schedule?.startTime)}
        </p>
        <p>
          <strong>Конец работы:</strong> {formatScheduleTime(schedule?.endTime)}
        </p>
        <p>
          <strong>Доступен:</strong>{" "}
          {schedule ? (schedule.isAvailable ? "Да" : "Нет") : "Неизвестно"}
        </p>
      </div>
    </div>
  );
};
