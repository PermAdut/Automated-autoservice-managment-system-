import React, { useMemo, useState } from "react";
import {
  useGetSuppliersQuery,
  useDeleteSupplierMutation,
} from "../../../api/suppliersApi";
import { SupplierItem } from "../SupplierItem/SupplierItem";
import { useDebounce } from "../../../hooks/useDebounce";
import SupplierForm from "../SupplierForm/SupplierForm";
import "./SupplierList.css";

const SUPPLIERS_PER_PAGE = 6;

const SupplierList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const debouncedSearch = useDebounce(search, 300);

  const {
    data: suppliers = [],
    isLoading: loading,
    error,
  } = useGetSuppliersQuery({
    search: debouncedSearch,
    sortBy: "name",
    sortOrder,
  });

  const [deleteSupplier] = useDeleteSupplierMutation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const editingSupplier = useMemo(
    () => suppliers.find((s) => s.id === editingId),
    [editingId, suppliers]
  );

  if (loading) return <div className="supplier-list-loading">Загрузка...</div>;
  if (error)
    return (
      <div className="supplier-list-error">
        Ошибка:{" "}
        {error && "status" in error
          ? String(error.status)
          : "Неизвестная ошибка"}
      </div>
    );

  const totalPages = Math.ceil(suppliers.length / SUPPLIERS_PER_PAGE);
  const paginatedSuppliers = suppliers.slice(
    (currentPage - 1) * SUPPLIERS_PER_PAGE,
    currentPage * SUPPLIERS_PER_PAGE
  );

  return (
    <div className="supplier-list-container">
      <div className="supplier-list-header">
        <h1 className="supplier-list-title">Список поставщиков</h1>
        <button
          className="btn-add"
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
        >
          + Добавить поставщика
        </button>
      </div>
      <div className="supplier-list-filters filter-bar">
        <input
          className="filter-input"
          type="text"
          placeholder="Поиск по названию/ID"
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
      <div className="supplier-list-grid">
        {paginatedSuppliers.map((supplier) => (
          <div className="supplier-card" key={supplier.id}>
            <SupplierItem
              id={supplier.id}
              name={supplier.name}
              address={supplier.address}
              contact={supplier.contact}
              positionsForBuying={supplier.positionsForBuying}
            />
            <div className="supplier-card-actions">
              <button
                className="btn-edit"
                onClick={() => {
                  setEditingId(supplier.id);
                  setShowForm(true);
                }}
              >
                Редактировать
              </button>
              <button
                className="btn-delete"
                onClick={async () => {
                  if (!window.confirm("Удалить поставщика?")) return;
                  try {
                    await deleteSupplier(supplier.id).unwrap();
                  } catch (err) {
                    console.error("Failed to delete supplier", err);
                    alert("Не удалось удалить поставщика");
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
        <div className="supplier-list-pagination">
          <button
            className="supplier-list-button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Назад
          </button>
          <span className="supplier-list-page-info">
            {currentPage} / {totalPages}
          </span>
          <button
            className="supplier-list-button"
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
        <SupplierForm
          initialData={
            editingSupplier ?? {
              name: "",
              contact: "",
              address: "",
            }
          }
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          supplierId={editingSupplier?.id ?? null}
        />
      )}
    </div>
  );
};

export default SupplierList;
