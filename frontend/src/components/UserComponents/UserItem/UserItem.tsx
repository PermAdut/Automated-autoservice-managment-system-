import { FC } from "react";
import { Link } from "react-router-dom";
import { UserItemProps } from "./UserItem";
import './UserItem.css';

export const UserItem: FC<UserItemProps> = ({
  id,
  name,
  secondName,
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
    </div>
  );
};
