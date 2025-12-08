import { useState } from "react";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../../../api/usersApi";
import { UserItem } from "../UserItem/UserItem.tsx";
import { useDebounce } from "../../../hooks/useDebounce";
import "./UserList.css";

const USERS_PER_PAGE = 5;

const UserList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const debouncedSearch = useDebounce(search, 300);

  const {
    data: users = [],
    isLoading: loading,
    error,
  } = useGetUsersQuery({
    search: debouncedSearch,
    sortBy: "name",
    sortOrder,
  });

  const [deleteUserMutation] = useDeleteUserMutation();
  const [updateUserMutation] = useUpdateUserMutation();

  if (loading) return <div className="userlist-loading">Загрузка...</div>;
  if (error)
    return (
      <div className="userlist-error">
        Ошибка:{" "}
        {error && "status" in error
          ? String(error.status)
          : "Неизвестная ошибка"}
      </div>
    );

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  return (
    <div className="userlist-container">
      <h1 className="user userlist-title">Список пользователей</h1>
      <div className="userlist-filters filter-bar">
        <input
          className="filter-input"
          type="text"
          placeholder="Поиск по имени/фамилии/ID"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          className="filter-select"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
        >
          <option value="asc">Возр.</option>
          <option value="desc">Убыв.</option>
        </select>
      </div>
      <div className="userlist-grid">
        {paginatedUsers.length > 0 ? (
          paginatedUsers.map((user) => (
            <div className="userlist-item-wrapper" key={user.id}>
              <UserItem
                id={user.id}
                name={user.name}
                secondName={user.surName}
                onDelete={async () => {
                  try {
                    await deleteUserMutation(user.id).unwrap();
                  } catch (err) {
                    console.error("Failed to delete user:", err);
                  }
                }}
                onUpdate={async (body) => {
                  try {
                    const { role, ...rest } = body as any;
                    await updateUserMutation({
                      id: user.id,
                      data: {
                        ...rest,
                        roleId: (role as any)?.id ?? (body as any)?.roleId,
                      },
                    }).unwrap();
                  } catch (err) {
                    console.error("Failed to update user:", err);
                  }
                }}
              />
            </div>
          ))
        ) : (
          <div className="userlist-empty">Пользователей нет</div>
        )}
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
