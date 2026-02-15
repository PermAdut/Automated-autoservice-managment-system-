import React from "react";

interface ServiceItemProps {
  id: string;
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
    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 m-0">{name}</h2>
        <p className="text-sm text-gray-500 mt-1">ID: {id}</p>
      </div>

      <div className="[&_p]:text-base [&_p]:text-gray-500 [&_p]:my-1 [&_strong]:text-gray-800">
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
