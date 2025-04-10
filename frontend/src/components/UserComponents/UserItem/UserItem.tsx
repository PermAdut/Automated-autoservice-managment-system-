import { FC } from "react";
import { Link } from "react-router-dom";
import { UserItemProps } from "./UserItem";
import './UserItem.css';

export const UserItem: FC<UserItemProps> = ({
  id,
  name,
  secondName,
  orders,
}) => {
  return (
    <div className="useritem-card">
      <div className="useritem-header">
        <h2 className="useritem-name">
          <Link to={`/user/${id}`} className="useritem-link">
            {name} {secondName}
          </Link>
        </h2>
        <p className="useritem-info">Информация пользователя</p>
      </div>

      {orders && orders.length > 0 ? (
        <div>
          <h3 className="useritem-orders-title">Заказы</h3>
          <ul className="useritem-orders-list">
            {orders.map((order, index) => (
              <li key={index} className="useritem-order">
                <h4 className="useritem-order-title">{order.title}</h4>
                {order.description && (
                  <p className="useritem-order-desc">{order.description}</p>
                )}
                <p className="useritem-order-dates">
                  {order.dateStart} - {order.dateEnd}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="useritem-no-orders">Заказов не найдено</p>
      )}
    </div>
  );
};
