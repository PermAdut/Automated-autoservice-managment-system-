import React from "react";
import "./SupplierItem.css";

interface SupplierItemProps {
  id: number;
  name: string;
  address: string;
  contact: string;
  positionsForBuying: {
    id: number;
    quantity: number;
    deliverDate: string;
    status: string;
    sparePart: {
      id: number;
      name: string;
      price: number;
      quantity: number;
      description: string;
      category: {
        id: number;
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
    <div className="supplier-item-card">
      <div className="supplier-item-header">
        <h2 className="supplier-item-title">{name}</h2>
        <p className="supplier-item-info">ID: {id}</p>
      </div>

      <div className="supplier-item-details">
        <p>
          <strong>Адрес:</strong> {address}
        </p>
        <p>
          <strong>Контакт:</strong> {contact}
        </p>
      </div>

      {positionsForBuying && positionsForBuying.length > 0 && (
        <div className="supplier-item-section">
          <h3>Позиции для закупки</h3>
          {positionsForBuying.map((position) => (
            <div key={position.id} className="supplier-item-subitem">
              <p>
                <strong>ID позиции:</strong> {position.id}
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
                <div className="supplier-item-sparepart">
                  <h4>Запчасти:</h4>
                  {position.sparePart.map((part) => (
                    <div key={part.id} className="supplier-item-sparepart-details">
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