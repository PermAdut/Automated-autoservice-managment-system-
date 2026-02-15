import React from "react";

interface StorageItemProps {
  id: string;
  quantity: number;
  sparePart: {
    id: string;
    name: string;
    price: number | string;
    partNumber: string;
    category?: {
      id: string;
      name: string;
      description?: string;
    };
  };
  location: string;
}

export const StorageItem: React.FC<StorageItemProps> = ({
  id,
  quantity,
  sparePart,
  location,
}) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 m-0">{sparePart.name}</h2>
      </div>

      <div className="[&_p]:text-base [&_p]:text-gray-500 [&_p]:my-1 [&_strong]:text-gray-800">
        <p>
          <strong>Количество:</strong> {quantity} шт.
        </p>
        <p>
          <strong>Артикул:</strong> {sparePart.partNumber}
        </p>
        <p>
          <strong>Цена:</strong> {sparePart.price} руб.
        </p>
        <p>
          <strong>Категория:</strong> {sparePart.category?.name ?? "Не указано"}{" "}
          ({sparePart.category?.description ?? "—"})
        </p>
        <p>
          <strong>Местоположение:</strong> {location}
        </p>
      </div>
    </div>
  );
};
