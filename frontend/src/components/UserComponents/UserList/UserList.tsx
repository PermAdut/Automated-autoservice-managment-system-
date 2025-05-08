import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { deleteUser, fetchUsers, updateUser } from "../../../store/slices/userSlice";
import { UserItem } from "../UserItem/UserItem.tsx";
import "./UserList.css";

const USERS_PER_PAGE = 5;

const UserList = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) return <div className="userlist-loading">Загрузка...</div>;
  if (error) return <div className="userlist-error">Ошибка: {error}</div>;

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  return (
    <div className="userlist-container">
      <h1 className="user userlist-title">Список пользователей</h1>
      <div className="userlist-grid">
        {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
          <div className="userlist-item-wrapper" key={user.id}>
            <UserItem
              id={user.id}
              name={user.name}
              secondName={user.surName}
              onDelete={() => {
                dispatch(deleteUser(user.id));
              }}
              onUpdate={(body) => {
                dispatch(updateUser(body));
              }}
            />
          </div>
        )) : <div className="userlist-empty">Пользователей нет</div>}
      </div>

      {totalPages > 1 && (
        <div className="userlist-pagination">
          <button
            className="userlist-button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Назад
          </button>
          <span className="userlist-page-info">
            {currentPage} / {totalPages}
          </span>
          <button
            className="userlist-button"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  );
};

export default UserList;
