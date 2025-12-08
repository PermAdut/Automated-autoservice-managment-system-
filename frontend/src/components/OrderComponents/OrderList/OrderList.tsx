import React, { useMemo, useState } from "react";
import {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  Order,
} from "../../../api/ordersApi";
import { OrderItem } from "../OrderItem/OrderItem";
import OrderForm from "../OrderForm/OrderForm";
import "./OrderList.css";

const ORDERS_PER_PAGE = 3;

const OrderList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "status" | "id">(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const {
    data: orders = [],
    isLoading,
    error,
  } = useGetOrdersQuery({
    search,
    sortBy,
    sortOrder,
  });

  const [createOrder] = useCreateOrderMutation();
  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const filteredSorted = useMemo(() => {
    const filtered = orders.filter((order) => {
      const term = search.toLowerCase();
      return (
        String(order.id).includes(term) ||
        order.status?.toLowerCase().includes(term)
      );
    });
    const sorted = [...filtered].sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "createdAt") {
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          dir
        );
      }
      if (sortBy === "status") {
        return (a.status || "").localeCompare(b.status || "") * dir;
      }
      return (a.id - b.id) * dir;
    });
    return sorted;
  }, [orders, search, sortBy, sortOrder]);

  if (isLoading) return <div className="order-list-loading">Загрузка...</div>;
  if (error)
    return (
      <div className="order-list-error">
        Ошибка:{" "}
        {error && "status" in error
          ? String(error.status)
          : "Неизвестная ошибка"}
      </div>
    );

  const totalPages = Math.ceil(filteredSorted.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredSorted.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  return (
    <div className="order-list-container">
      <div className="order-list-header">
        <h1 className="order-list-title">Список заказов</h1>
        <button
          className="btn-add"
          onClick={() => {
            setEditingOrder(null);
            setShowForm(true);
          }}
        >
          + Добавить заказ
        </button>
      </div>
      <div className="order-list-filters">
        <input
          type="text"
          placeholder="Поиск по номеру/статусу"
          value={search}
          onChange={(e) => {
            setCurrentPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
        >
          <option value="createdAt">Дата</option>
          <option value="status">Статус</option>
          <option value="id">ID</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
        >
          <option value="asc">Возр.</option>
          <option value="desc">Убыв.</option>
        </select>
      </div>
      <div className="order-list-grid">
        {paginatedOrders.map((order) => (
          <div className="order-card" key={order.id}>
            <OrderItem
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
            <div className="order-card-actions">
              <button
                className="btn-edit"
                onClick={() => {
                  setEditingOrder(order);
                  setShowForm(true);
                }}
              >
                Редактировать
              </button>
              <button
                className="btn-delete"
                onClick={async () => {
                  if (!window.confirm("Удалить заказ?")) return;
                  try {
                    await deleteOrder(order.id).unwrap();
                  } catch (err) {
                    console.error("Failed to delete order", err);
                    alert("Не удалось удалить заказ");
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
      {showForm && (
        <OrderForm
          order={editingOrder ?? null}
          onClose={() => {
            setShowForm(false);
            setEditingOrder(null);
          }}
          onSubmit={async (payload, id) => {
            try {
              if (id) {
                await updateOrder({ id, data: payload }).unwrap();
              } else {
                await createOrder(payload).unwrap();
              }
              setShowForm(false);
              setEditingOrder(null);
            } catch (err) {
              console.error("Failed to save order", err);
              alert("Не удалось сохранить заказ");
            }
          }}
        />
      )}
    </div>
  );
};

export default OrderList;
