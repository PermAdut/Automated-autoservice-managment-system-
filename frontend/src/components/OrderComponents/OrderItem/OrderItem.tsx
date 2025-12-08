import React from "react";
import "./OrderItem.css";

interface OrderItemProps {
  id: number;
  userId: number;
  carId: number | null;
  employeeId: number | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  completedAt: string | null;
  services?: { id: number; name: string; description: string; price: number }[];
  sparePart?: {
    id: number;
    name: string;
    partNumber: string;
    price: number;
    category?: { id: number; name: string; description?: string };
  }[];
}

export const OrderItem: React.FC<OrderItemProps> = ({
  id,
  userId,
  carId,
  employeeId,
  status,
  createdAt,
  updatedAt,
  completedAt,
  services,
  sparePart,
}) => {
  return (
    <div className="order-item-card">
      <div className="order-item-header">
        <h2 className="order-item-title">Заказ #{id}</h2>
        <p className="order-item-info">Статус: {status}</p>
      </div>

      <div className="order-item-details">
        <p>
          <strong>ID клиента:</strong> {userId}
        </p>
        <p>
          <strong>ID автомобиля:</strong> {carId || "Не указан"}
        </p>
        <p>
          <strong>ID сотрудника:</strong> {employeeId || "Не назначен"}
        </p>
        <p>
          <strong>Создан:</strong> {new Date(createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Обновлён:</strong>{" "}
          {updatedAt ? new Date(updatedAt).toLocaleString() : "Не обновлён"}
        </p>
        <p>
          <strong>Завершён:</strong>{" "}
          {completedAt ? new Date(completedAt).toLocaleString() : "Не завершён"}
        </p>
      </div>

      {services && services.length > 0 && (
        <div className="order-item-section">
          <h3>Услуги</h3>
          {services.map((service) => (
            <div key={service.id} className="order-item-subitem">
              <p>
                <strong>Название:</strong> {service.name}
              </p>
              <p>
                <strong>Описание:</strong> {service.description}
              </p>
              <p>
                <strong>Цена:</strong> {service.price} руб.
              </p>
            </div>
          ))}
        </div>
      )}

      {sparePart && sparePart.length > 0 && (
        <div className="order-item-section">
          <h3>Запчасти</h3>
          {sparePart.map((part) => (
            <div key={part.id} className="order-item-subitem">
              <p>
                <strong>Название:</strong> {part.name}
              </p>
              <p>
                <strong>Артикул:</strong> {part.partNumber}
              </p>
              <p>
                <strong>Цена:</strong> {part.price} руб.
              </p>
              <p>
                <strong>Категория:</strong>{" "}
                {part.category?.name ?? "Не указано"} (
                {part.category?.description ?? "—"})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
