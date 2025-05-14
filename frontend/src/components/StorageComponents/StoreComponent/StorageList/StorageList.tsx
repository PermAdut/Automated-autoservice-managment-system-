import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import { fetchSparePartsStock } from "../../../../store/slices/storeSlice";
import { StorageItem } from "../StorageItem/StorageItem";
import "./StorageList.css";

const STORES_PER_PAGE = 6;

const StorageList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { spareParts, isLoading, error } = useAppSelector((state) => state.store);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchSparePartsStock());
  }, [dispatch]);

  if (isLoading) return <div className="storage-list-loading">Загрузка...</div>;
  if (error) return <div className="storage-list-error">Ошибка: {error}</div>;

  const totalPages = Math.ceil(spareParts.length / STORES_PER_PAGE);
  const paginatedSpareParts = spareParts.slice(
    (currentPage - 1) * STORES_PER_PAGE,
    currentPage * STORES_PER_PAGE
  );

  return (
    <div className="storage-list-container">
      <h1 className="storage-list-title">Список запчастей на складах</h1>
      <div className="storage-list-grid">
        {paginatedSpareParts.map((sparePart) => (
          <StorageItem
            key={sparePart.id}
            id={sparePart.id}
            quantity={sparePart.quantity}
            sparePart={sparePart.sparePart}
            location={sparePart.location}
          />
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
    </div>
  );
};

export default StorageList;