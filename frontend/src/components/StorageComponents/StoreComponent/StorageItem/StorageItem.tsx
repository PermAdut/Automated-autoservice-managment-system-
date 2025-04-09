import React from "react";
import "./StorageItem.css";

interface StorageItemProps {
  id: number;
  quantity: number;
  sparePart: {
    id: number;
    name: string;
    price: number;
    partNumber: string;
    category: {
      id: number;
      name: string;
      description: string;
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
    <div className="storage-item-card">
      <div className="storage-item-header">
        <h2 className="storage-item-title">{sparePart.name}</h2>
        <p className="storage-item-info">ID склада: {id}</p>
      </div>

      <div className="storage-item-details">
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
          <strong>Категория:</strong> {sparePart.category.name} (
          {sparePart.category.description})
        </p>
        <p>
          <strong>Местоположение:</strong> {location}
        </p>
      </div>
    </div>
  );
};