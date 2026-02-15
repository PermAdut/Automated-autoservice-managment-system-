import { useState } from "react";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../../../api/usersApi";
import { UserItem } from "../UserItem/UserItem.tsx";
import { useDebounce } from "../../../hooks/useDebounce";

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

  if (loading) return <div className="mt-10 text-center text-lg font-semibold text-gray-700 animate-pulse">Загрузка...</div>;
  if (error)
    return (
      <div className="mt-10 text-center text-lg font-semibold text-red-500">
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
    <div className="p-6 pb-20 max-w-7xl mx-auto relative">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Список пользователей</h1>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          className="px-3 py-2.5 border-2 border-gray-200 rounded-lg min-w-[200px] text-sm transition-all focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none"
          type="text"
          placeholder="Поиск по имени/фамилии/ID"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          className="px-3 py-2.5 border-2 border-gray-200 rounded-lg min-w-[140px] text-sm transition-all focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
        >
          <option value="asc">Возр.</option>
          <option value="desc">Убыв.</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedUsers.length > 0 ? (
          paginatedUsers.map((user) => (
            <div className="transition-transform hover:scale-105" key={user.id}>
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
          <div className="col-span-full text-center p-8 text-lg text-gray-500">Пользователей нет</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6 sticky bottom-5 bg-white p-2.5 rounded-md shadow-sm">
          <button
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md bg-white text-primary cursor-pointer transition-all hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Назад
          </button>
          <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
            {currentPage} / {totalPages}
          </span>
          <button
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md bg-white text-primary cursor-pointer transition-all hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
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
