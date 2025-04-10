import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { fetchSuppliers } from "../../../store/slices/suppliersSlice";
import { SupplierItem } from "../SupplierItem/SupplierItem";
import "./SupplierList.css";

const SUPPLIERS_PER_PAGE = 6;

const SupplierList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { suppliers, loading, error } = useAppSelector(
    (state) => state.suppliers
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  if (loading) return <div className="supplier-list-loading">Загрузка...</div>;
  if (error) return <div className="supplier-list-error">Ошибка: {error}</div>;

  const totalPages = Math.ceil(suppliers.length / SUPPLIERS_PER_PAGE);
  const paginatedSuppliers = suppliers.slice(
    (currentPage - 1) * SUPPLIERS_PER_PAGE,
    currentPage * SUPPLIERS_PER_PAGE
  );

  return (
    <div className="supplier-list-container">
      <h1 className="supplier-list-title">Список поставщиков</h1>
      <div className="supplier-list-grid">
        {paginatedSuppliers.map((supplier) => (
          <SupplierItem
            key={supplier.id}
            id={supplier.id}
            name={supplier.name}
            address={supplier.address}
            contact={supplier.contact}
            positionsForBuying={supplier.positionsForBuying}
          />
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
    </div>
  );
};

export default SupplierList;