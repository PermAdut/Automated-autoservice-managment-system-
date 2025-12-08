import React, { useMemo, useState } from "react";
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
import "./StorageList.css";

const STORES_PER_PAGE = 6;

const StorageList: React.FC = () => {
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

  if (isLoading) return <div className="storage-list-loading">Загрузка...</div>;
  if (error)
    return (
      <div className="storage-list-error">
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
    <div className="storage-list-container">
      <div className="storage-list-header">
        <h1 className="storage-list-title">Список запчастей на складах</h1>
        <button
          className="btn-add"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + Добавить
        </button>
      </div>
      <div className="storage-list-filters">
        <input
          type="text"
          placeholder="Поиск по названию/складу/ID"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
        >
          <option value="asc">Возр.</option>
          <option value="desc">Убыв.</option>
        </select>
      </div>
      <div className="storage-list-grid">
        {paginatedSpareParts.map((sparePart) => (
          <div className="storage-card" key={sparePart.store_id}>
            <StorageItem
              id={sparePart.store_id}
              quantity={sparePart.quantity}
              sparePart={sparePart.sparePart}
              location={sparePart.location}
            />
            <div className="storage-card-actions">
              <button
                className="btn-edit"
                onClick={() => {
                  setEditing(sparePart);
                  setShowForm(true);
                }}
              >
                Редактировать
              </button>
              <button
                className="btn-delete"
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
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="storage-list-pagination">
          <button
            className="storage-list-button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Назад
          </button>
          <span className="storage-list-page-info">
            {currentPage} / {totalPages}
          </span>
          <button
            className="storage-list-button"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Вперед
          </button>
        </div>
      )}
      {showForm && (
        <StorageForm
          stock={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSubmit={async (
            payload: SpareStockPayload,
            sparePartId?: number
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
