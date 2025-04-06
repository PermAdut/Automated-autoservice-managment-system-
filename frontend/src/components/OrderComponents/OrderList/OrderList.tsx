import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { fetchOrders } from "../../../store/slices/orderSlice";
import { OrderItem } from "../OrderItem/OrderItem";
import "./OrderList.css";

const ORDERS_PER_PAGE = 3;

const OrderList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, isLoading, error } = useAppSelector((state) => state.order);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  if (isLoading) return <div className="order-list-loading">Загрузка...</div>;
  if (error) return <div className="order-list-error">Ошибка: {error}</div>;

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  return (
    <div className="order-list-container">
      <h1 className="order-list-title">Список заказов</h1>
      <div className="order-list-grid">
        {paginatedOrders.map((order) => (
          <OrderItem
            key={order.id}
            id={order.id}
            userId={order.userId}
            carId={order.carId}
            employeeId={order.employeeId}
            status={order.status}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
            completedAt={order.completedAt}
            services={order.services}
            sparePart={order.sparePart}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="order-list-pagination">
          <button
            className="order-list-button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Назад
          </button>
          <span className="order-list-page-info">
            {currentPage} / {totalPages}
          </span>
          <button
            className="order-list-button"
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

export default OrderList;