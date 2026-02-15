import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import {
  useGetSparePartsQuery,
  useCreateSparePartMutation,
  useUpdateSparePartMutation,
  useDeleteSparePartMutation,
  SparePartStock,
  SpareStockPayload,
} from "../../../../api/sparePartsApi";
import { StorageItem } from "../StorageItem/StorageItem";
import { useDebounce } from "../../../../hooks/useDebounce";
import StorageForm from "../StorageForm/StorageForm";

const STORES_PER_PAGE = 6;

const StorageList: React.FC = () => {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const canManage =
    isAuthenticated &&
    (user?.roleName === "admin" || user?.roleName === "manager");

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const debouncedSearch = useDebounce(search, 300);

  const {
    data: spareParts = [],
    isLoading,
    error,
  } = useGetSparePartsQuery({
    search: debouncedSearch,
    sortBy: "name",
    sortOrder,
  });

  const [createStock] = useCreateSparePartMutation();
  const [updateStock] = useUpdateSparePartMutation();
  const [deleteStock] = useDeleteSparePartMutation();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SparePartStock | null>(null);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return spareParts.filter((s) => {
      return (
        s.sparePart?.name?.toLowerCase().includes(term) ||
        s.location?.toLowerCase().includes(term) ||
        String(s.sparePart?.id).includes(term)
      );
    });
  }, [spareParts, search]);

  if (isLoading) return <div className="mt-10 text-center text-lg font-semibold text-gray-700 animate-pulse">Загрузка...</div>;
  if (error)
    return (
      <div className="mt-10 text-center text-lg font-semibold text-red-500">
        Ошибка:{" "}
        {error && "status" in error
          ? String(error.status)
          : "Неизвестная ошибка"}
      </div>
    );

  const totalPages = Math.ceil(filtered.length / STORES_PER_PAGE);
  const paginatedSpareParts = filtered.slice(
    (currentPage - 1) * STORES_PER_PAGE,
    currentPage * STORES_PER_PAGE
  );

  return (
    <div className="p-6 pb-20 max-w-7xl mx-auto relative">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Список запчастей на складах</h1>
        {canManage && (
          <button
            className="bg-primary text-white border-none px-4 py-2.5 rounded-lg cursor-pointer font-semibold transition-all hover:bg-primary-dark"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + Добавить
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          className="px-3 py-2.5 border-2 border-gray-200 rounded-lg min-w-[200px] text-sm transition-all focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none"
          type="text"
          placeholder="Поиск по названию/складу/ID"
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
        {paginatedSpareParts.map((sparePart) => (
          <div className="border border-gray-200 rounded-xl p-3 shadow-sm flex flex-col gap-2.5" key={sparePart.store_id}>
            <StorageItem
              id={sparePart.store_id}
              quantity={sparePart.quantity}
              sparePart={sparePart.sparePart}
              location={sparePart.location}
            />
            {canManage && (
              <div className="flex gap-2.5 justify-end">
                <button
                  className="px-3 py-2 border-none rounded-lg cursor-pointer font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200"
                  onClick={() => {
                    setEditing(sparePart);
                    setShowForm(true);
                  }}
                >
                  Редактировать
                </button>
                <button
                  className="px-3 py-2 border-none rounded-lg cursor-pointer font-semibold bg-red-500 text-white hover:bg-red-600"
                  onClick={async () => {
                    if (!window.confirm("Удалить запись склада?")) return;
                    try {
                      await deleteStock(sparePart.sparePart.id).unwrap();
                    } catch (err) {
                      console.error("Failed to delete stock", err);
                      alert("Не удалось удалить");
                    }
                  }}
                >
                  Удалить
                </button>
              </div>
            )}
          </div>
        ))}
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
          <span className="text-sm font-medium text-gray-700">
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
      {canManage && showForm && (
        <StorageForm
          stock={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSubmit={async (
            payload: SpareStockPayload,
            sparePartId?: string
          ) => {
            try {
              if (sparePartId) {
                await updateStock({ id: sparePartId, data: payload }).unwrap();
              } else {
                await createStock(payload).unwrap();
              }
              setShowForm(false);
              setEditing(null);
            } catch (err) {
              console.error("Failed to save stock", err);
              alert("Не удалось сохранить");
            }
          }}
        />
      )}
    </div>
  );
};

export default StorageList;
