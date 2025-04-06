import React from "react";
import "./EmployeeItem.css";

interface EmployeeItemProps {
  id: number;
  position: { id: number; name: string; description?: string };
  orders: { id: number; status: string };
  schedule: { startTime: string; endTime: string; isAvailable: boolean };
  hireDate: string;
  salary: number;
}

export const EmployeeItem: React.FC<EmployeeItemProps> = ({
  id,
  position,
  orders,
  schedule,
  hireDate,
  salary,
}) => {
  return (
    <div className="employee-item-card">
      <div className="employee-item-header">
        <h2 className="employee-item-name">{position.name}</h2>
        <p className="employee-item-info">ID: {id}</p>
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
          <strong>Дата найма:</strong>{" "}
          {new Date(hireDate).toLocaleDateString()}
        </p>
      </div>

      <div className="employee-item-section">
        <h3>Текущий заказ</h3>
        <p>
          <strong>ID заказа:</strong> {orders.id}
        </p>
        <p>
          <strong>Статус:</strong> {orders.status}
        </p>
      </div>

      <div className="employee-item-section">
        <h3>Расписание</h3>
        <p>
          <strong>Начало:</strong>{" "}
          {new Date(schedule.startTime).toLocaleString()}
        </p>
        <p>
          <strong>Конец:</strong> {new Date(schedule.endTime).toLocaleString()}
        </p>
        <p>
          <strong>Доступен:</strong> {schedule.isAvailable ? "Да" : "Нет"}
        </p>
      </div>
    </div>
  );
};