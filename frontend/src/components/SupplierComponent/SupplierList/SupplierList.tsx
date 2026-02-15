import React, { useMemo, useState } from "react";
import {
  useGetSuppliersQuery,
  useDeleteSupplierMutation,
} from "../../../api/suppliersApi";
import { SupplierItem } from "../SupplierItem/SupplierItem";
import { useDebounce } from "../../../hooks/useDebounce";
import SupplierForm from "../SupplierForm/SupplierForm";

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
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingSupplier = useMemo(
    () => suppliers.find((s) => s.id === editingId),
    [editingId, suppliers]
  );

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

  const totalPages = Math.ceil(suppliers.length / SUPPLIERS_PER_PAGE);
  const paginatedSuppliers = suppliers.slice(
    (currentPage - 1) * SUPPLIERS_PER_PAGE,
    currentPage * SUPPLIERS_PER_PAGE
  );

  return (
    <div className="p-6 pb-20 max-w-7xl mx-auto relative">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Список поставщиков</h1>
        <button
          className="bg-primary text-white border-none px-4 py-2.5 rounded-lg cursor-pointer font-semibold transition-all hover:bg-primary-dark"
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
        >
          + Добавить поставщика
        </button>
      </div>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          className="px-3 py-2.5 border-2 border-gray-200 rounded-lg min-w-[200px] text-sm transition-all focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none"
          type="text"
          placeholder="Поиск по названию/ID"
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
        {paginatedSuppliers.map((supplier) => (
          <div className="border border-gray-200 rounded-xl p-3 shadow-sm flex flex-col gap-2.5" key={supplier.id}>
            <SupplierItem
              id={supplier.id}
              name={supplier.name}
              address={supplier.address}
              contact={supplier.contact}
              positionsForBuying={supplier.positionsForBuying}
            />
            <div className="flex gap-2.5 justify-end">
              <button
                className="px-3 py-2 border-none rounded-lg cursor-pointer font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200"
                onClick={() => {
                  setEditingId(supplier.id);
                  setShowForm(true);
                }}
              >
                Редактировать
              </button>
              <button
                className="px-3 py-2 border-none rounded-lg cursor-pointer font-semibold bg-red-500 text-white hover:bg-red-600"
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
