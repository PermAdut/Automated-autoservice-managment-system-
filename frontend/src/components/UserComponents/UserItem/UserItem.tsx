import { FC } from "react";
import { Link } from "react-router-dom";
import { UserItemProps } from "./UserItem";

export const UserItem: FC<UserItemProps> = ({
  id,
  name,
  secondName,
  orders,
}) => {
  return (
    <div className="p-6 mx-auto mb-[20px] bg-white border border-gray-200 rounded-lg shadow-lg">
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-wide text-gray-100 no-underline hover:text-white">
          <Link
            to={`/user/${id}`}
            className="font-bold tracking-wide text-gray-100 no-underline hover:text-white"
          >
            {name} {secondName}
          </Link>
        </h2>
        <p className="text-sm text-gray-600">Информация пользователя</p>
      </div>

      {orders && orders.length > 0 ? (
        <div>
          <h3 className="mb-2 text-lg font-medium text-gray-800">Заказы</h3>
          <ul className="space-y-3">
            {orders.map((order, index) => (
              <li
                key={index}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <h4 className="font-semibold text-gray-800 text-md">
                  {order.title}
                </h4>
                {order.description && (
                  <p className="text-sm text-gray-600">{order.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {order.dateStart} - {order.dateEnd}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Заказов не найдено</p>
      )}
    </div>
  );
};
