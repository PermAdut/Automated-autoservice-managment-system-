import React from "react";
import { getOrderStatusLabel } from "../../../utils/orderStatus";

interface OrderItemProps {
  id: string;
  userId: string;
  carId: string | null;
  employeeId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  completedAt: string | null;
  services?: { id: string; name: string; description: string; price: number | string }[];
  sparePart?: {
    id: string;
    name: string;
    partNumber: string;
    price: number | string;
    category?: { id: string; name: string; description?: string };
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
  const carLabel = carId ? `Автомобиль назначен` : "Авто не указано";
  const employeeLabel = employeeId
    ? `Сотрудник назначен`
    : "Сотрудник не назначен";

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all" data-user-id={userId}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 m-0">
          Заказ #{id.slice(0, 8)}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Статус: {getOrderStatusLabel(status)}
        </p>
      </div>

      <div className="[&_p]:text-base [&_p]:text-gray-500 [&_p]:my-1 [&_strong]:text-gray-800">
        <p>
          <strong>Клиент:</strong> Клиент назначен
        </p>
        <p>
          <strong>Автомобиль:</strong> {carLabel}
        </p>
        <p>
          <strong>Сотрудник:</strong> {employeeLabel}
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
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Услуги</h3>
          {services.map((service) => (
            <div
              key={service.id}
              className="p-2.5 border border-gray-200 rounded-lg mb-2.5 bg-gray-50 [&_p]:text-sm [&_p]:text-gray-500 [&_p]:my-1 [&_strong]:text-gray-800"
            >
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
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Запчасти</h3>
          {sparePart.map((part) => (
            <div
              key={part.id}
              className="p-2.5 border border-gray-200 rounded-lg mb-2.5 bg-gray-50 [&_p]:text-sm [&_p]:text-gray-500 [&_p]:my-1 [&_strong]:text-gray-800"
            >
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
