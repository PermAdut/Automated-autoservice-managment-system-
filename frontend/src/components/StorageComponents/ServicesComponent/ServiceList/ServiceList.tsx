import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import { fetchServices } from "../../../../store/slices/servicesSlice";
import { ServiceItem } from "../ServiceItem/ServiceItem";
import "./ServiceList.css";

const SERVICES_PER_PAGE = 6;

const ServiceList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { services, isLoading, error } = useAppSelector(
    (state) => state.service
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  if (isLoading) return <div className="service-list-loading">Загрузка...</div>;
  if (error) return <div className="service-list-error">Ошибка: {error}</div>;

  const totalPages = Math.ceil(services.length / SERVICES_PER_PAGE);
  const paginatedServices = services.length > 0 ? services.slice(
    (currentPage - 1) * SERVICES_PER_PAGE,
    currentPage * SERVICES_PER_PAGE
  ) : [];

  return (
    <div className="service-list-container">
      <h1 className="service-list-title">Список услуг</h1>
      <div className="service-list-grid">
        {paginatedServices.length > 0 ? paginatedServices.map((service) => (
          <ServiceItem
            key={service.id}
            id={service.id}
            name={service.name}
            description={service.description}
            price={service.price}
          />
        )) : (
          <div style={{ 
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '2rem',
            fontSize: '1.125rem',
            color: '#6b7280'
          }}>
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
    </div>
  );
};

export default ServiceList;