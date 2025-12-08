import React, { useMemo, useState } from "react";
import {
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} from "../../../../api/servicesApi";
import { ServiceItem } from "../ServiceItem/ServiceItem";
import { useDebounce } from "../../../../hooks/useDebounce";
import { ServiceForm } from "../ServiceForm/ServiceForm";
import "./ServiceList.css";

const SERVICES_PER_PAGE = 6;

const ServiceList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const debouncedSearch = useDebounce(search, 300);

  const {
    data: services = [],
    isLoading,
    error,
  } = useGetServicesQuery({
    search: debouncedSearch,
    sortBy: "name",
    sortOrder,
  });

  const [createService] = useCreateServiceMutation();
  const [updateService] = useUpdateServiceMutation();
  const [deleteService] = useDeleteServiceMutation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const safeServices = useMemo(
    () => (Array.isArray(services) ? services : []),
    [services]
  );

  if (isLoading) return <div className="service-list-loading">Загрузка...</div>;
  if (error)
    return (
      <div className="service-list-error">
        Ошибка:{" "}
        {error && "status" in error
          ? String(error.status)
          : "Неизвестная ошибка"}
      </div>
    );

  const totalPages = Math.ceil(safeServices.length / SERVICES_PER_PAGE);
  const paginatedServices =
    safeServices.length > 0
      ? safeServices.slice(
          (currentPage - 1) * SERVICES_PER_PAGE,
          currentPage * SERVICES_PER_PAGE
        )
      : [];

  return (
    <div className="service-list-container">
      <div className="service-list-header">
        <h1 className="service-list-title">Список услуг</h1>
        <button
          className="btn-add"
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
        >
          + Добавить услугу
        </button>
      </div>
      <div className="service-list-filters filter-bar">
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
      <div className="service-list-grid">
        {paginatedServices.length > 0 ? (
          paginatedServices.map((service) => (
            <div className="service-card" key={service.id}>
              <ServiceItem
                id={service.id}
                name={service.name}
                description={service.description}
                price={service.price}
              />
              <div className="service-card-actions">
                <button
                  className="btn-edit"
                  onClick={() => {
                    setEditingId(service.id);
                    setShowForm(true);
                  }}
                >
                  Редактировать
                </button>
                <button
                  className="btn-delete"
                  onClick={async () => {
                    if (!window.confirm("Удалить услугу?")) return;
                    try {
                      await deleteService(service.id).unwrap();
                    } catch (err) {
                      console.error("Failed to delete service", err);
                      alert("Не удалось удалить услугу");
                    }
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "2rem",
              fontSize: "1.125rem",
              color: "#6b7280",
            }}
          >
            Услуг нет
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="service-list-pagination">
          <button
            className="service-list-button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Назад
          </button>
          <span className="service-list-page-info">
            {currentPage} / {totalPages}
          </span>
          <button
            className="service-list-button"
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
        <ServiceForm
          serviceId={editingId ?? undefined}
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default ServiceList;
