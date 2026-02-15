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
import { getOrderStatusLabel } from "../../../utils/orderStatus";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

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
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrManager = user?.roleName === 'admin' || user?.roleName === 'manager';

  const {
    data: orders = [],
    isLoading,
    error,
  } = useGetOrdersQuery({
    search,
    sortBy,
    sortOrder,
    isAdmin: user?.roleName === 'admin',
  });

  const [createOrder] = useCreateOrderMutation();
  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const filteredSorted = useMemo(() => {
    const filtered = orders.filter((order) => {
      const term = search.toLowerCase();
      const statusLabel = getOrderStatusLabel(order.status).toLowerCase();
      return (
        String(order.id).includes(term) ||
        order.status?.toLowerCase().includes(term) ||
        statusLabel.includes(term)
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
      return a.id.localeCompare(b.id) * dir;
    });
    return sorted;
  }, [orders, search, sortBy, sortOrder]);

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

  const totalPages = Math.ceil(filteredSorted.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredSorted.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  return (
    <div className="p-6 pb-20 max-w-7xl mx-auto relative">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Список заказов</h1>
        <button
          className="bg-primary text-white border-none px-4 py-2.5 rounded-lg cursor-pointer font-semibold transition-all hover:bg-primary-dark"
          onClick={() => {
            setEditingOrder(null);
            setShowForm(true);
          }}
        >
          + Добавить заказ
        </button>
      </div>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          className="px-3 py-2.5 border-2 border-gray-200 rounded-lg min-w-[200px] text-sm transition-all focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none"
          type="text"
          placeholder="Поиск по номеру/статусу"
          value={search}
          onChange={(e) => {
            setCurrentPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          className="px-3 py-2.5 border-2 border-gray-200 rounded-lg min-w-[140px] text-sm transition-all focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
        >
          <option value="createdAt">Дата</option>
          <option value="status">Статус</option>
          <option value="id">ID</option>
        </select>
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
        {paginatedOrders.map((order) => (
          <div className="border border-gray-200 rounded-xl p-3 shadow-sm flex flex-col gap-2.5" key={order.id}>
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
            {isAdminOrManager && (
              <div className="flex gap-2.5 justify-end">
                <button
                  className="px-3 py-2 border-none rounded-lg cursor-pointer font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200"
                  onClick={() => {
                    setEditingOrder(order);
                    setShowForm(true);
                  }}
                >
                  Редактировать
                </button>
                <button
                  className="px-3 py-2 border-none rounded-lg cursor-pointer font-semibold bg-red-500 text-white hover:bg-red-600"
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
