import React from "react";

interface SupplierItemProps {
  id: string;
  name: string;
  address: string;
  contact: string;
  positionsForBuying: {
    id: string;
    quantity: number;
    deliverDate: string;
    status: string;
    sparePart?: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      description: string;
      category: {
        id: string;
        name: string;
        description: string;
      };
    }[];
  }[];
}

export const SupplierItem: React.FC<SupplierItemProps> = ({
  id,
  name,
  address,
  contact,
  positionsForBuying,
}) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 m-0">{name}</h2>
        <p className="text-sm text-gray-500 mt-1">ID: {id.slice(0, 8)}</p>
      </div>

      <div className="[&_p]:text-base [&_p]:text-gray-500 [&_p]:my-1 [&_strong]:text-gray-800">
        <p>
          <strong>Адрес:</strong> {address}
        </p>
        <p>
          <strong>Контакт:</strong> {contact}
        </p>
      </div>

      {positionsForBuying && positionsForBuying.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Позиции для закупки
          </h3>
          {positionsForBuying.map((position) => (
            <div
              key={position.id}
              className="p-2.5 border border-gray-200 rounded-lg mb-2.5 bg-gray-50 [&_p]:text-sm [&_p]:text-gray-500 [&_p]:my-1 [&_strong]:text-gray-800"
            >
              <p>
                <strong>ID позиции:</strong> {position.id.slice(0, 8)}
              </p>
              <p>
                <strong>Количество:</strong> {position.quantity} шт.
              </p>
              <p>
                <strong>Дата доставки:</strong>{" "}
                {new Date(position.deliverDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Статус:</strong> {position.status}
              </p>
              {position.sparePart && position.sparePart.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-base font-medium text-gray-700 mb-1.5">
                    Запчасти:
                  </h4>
                  {position.sparePart.map((part) => (
                    <div
                      key={part.id}
                      className="p-2 border border-dashed border-gray-300 rounded-md mb-2 bg-white [&_p]:text-sm [&_p]:text-gray-500 [&_p]:my-1 [&_strong]:text-gray-800"
                    >
                      <p>
                        <strong>Название:</strong> {part.name}
                      </p>
                      <p>
                        <strong>Цена:</strong> {part.price} руб.
                      </p>
                      <p>
                        <strong>Количество:</strong> {part.quantity} шт.
                      </p>
                      <p>
                        <strong>Описание:</strong> {part.description}
                      </p>
                      <p>
                        <strong>Категория:</strong> {part.category.name} (
                        {part.category.description})
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
