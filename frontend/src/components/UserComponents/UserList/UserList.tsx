import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { fetchUsers } from "../../../store/slices/userSlice";
import { UserItem } from "../UserItem/UserItem.tsx";

const USERS_PER_PAGE = 5;

const UserList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) return <div className="mt-10 text-center">Загрузка...</div>;
  if (error) return <div className="mt-10 text-center text-red-500">Ошибка: {error}</div>;

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const paginatedUsers = users.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  return (
    <div className="flex flex-col items-center mt-10">
      <div className="space-y-6">
        {paginatedUsers.map((user, index) => (
          <UserItem key={index} id={user.id} name={user.name} secondName={user.name} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex mt-6 space-x-2">
          <button
            className={`px-4 py-2 text-sm border rounded-lg ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-gray-100"}`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Назад
          </button>
          <span className="px-4 py-2 text-sm font-medium">{currentPage} / {totalPages}</span>
          <button
            className={`px-4 py-2 text-sm border rounded-lg ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-gray-100"}`}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
