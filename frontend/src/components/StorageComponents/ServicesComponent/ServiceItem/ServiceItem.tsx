import React from "react";
import "./ServiceItem.css";

interface ServiceItemProps {
  id: number;
  name: string;
  description: string;
  price: number | string;
}

export const ServiceItem: React.FC<ServiceItemProps> = ({
  id,
  name,
  description,
  price,
}) => {
  return (
    <div className="service-item-card">
      <div className="service-item-header">
        <h2 className="service-item-title">{name}</h2>
        <p className="service-item-info">ID: {id}</p>
      </div>

      <div className="service-item-details">
        <p>
          <strong>Описание:</strong> {description}
        </p>
        <p>
          <strong>Цена:</strong> {price} руб.
        </p>
      </div>
    </div>
  );
};
