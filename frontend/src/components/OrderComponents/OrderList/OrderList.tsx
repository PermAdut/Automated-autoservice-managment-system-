import React, { useMemo, useState } from "react";
import {
  PlusOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  EditOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
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
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Select } from "../../ui/select";
import { Card } from "../../ui/card";

const ORDERS_PER_PAGE = 6;

const OrderList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "status" | "id">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrManager =
    user?.roleName === "admin" || user?.roleName === "manager";

  const {
    data: orders = [],
    isLoading,
    error,
  } = useGetOrdersQuery({
    search,
    sortBy,
    sortOrder,
    isAdmin: user?.roleName === "admin",
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
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
        );
      }
      if (sortBy === "status") {
        return (a.status || "").localeCompare(b.status || "") * dir;
      }
      return a.id.localeCompare(b.id) * dir;
    });
    return sorted;
  }, [orders, search, sortBy, sortOrder]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 h-40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
          Ошибка загрузки заказов. Попробуйте обновить страницу.
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredSorted.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredSorted.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  return (
    <div className="p-4 pb-20 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <FileTextOutlined className="text-indigo-600 text-xl" />
          <h1 className="text-2xl font-bold text-gray-800">Заказы</h1>
          <span className="ml-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
            {filteredSorted.length}
          </span>
        </div>
        {isAdminOrManager && (
          <Button
            onClick={() => {
              setEditingOrder(null);
              setShowForm(true);
            }}
          >
            <PlusOutlined />
            Новый заказ
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
            <SearchOutlined />
          </span>
          <Input
            type="text"
            placeholder="Поиск по номеру / статусу"
            value={search}
            onChange={(e) => {
              setCurrentPage(1);
              setSearch(e.target.value);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="min-w-[130px]"
        >
          <option value="createdAt">По дате</option>
          <option value="status">По статусу</option>
          <option value="id">По ID</option>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder((v) => (v === "asc" ? "desc" : "asc"))}
          title={sortOrder === "asc" ? "По возрастанию" : "По убыванию"}
        >
          {sortOrder === "asc" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
        </Button>
      </div>

      {/* Empty state */}
      {paginatedOrders.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FileTextOutlined style={{ fontSize: 48 }} className="mb-3 opacity-30" />
          <p className="text-base font-medium">Заказы не найдены</p>
          <p className="text-sm mt-1">Попробуйте изменить параметры поиска</p>
        </div>
      )}

      {/* Orders grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedOrders.map((order) => (
          <Card key={order.id} className="flex flex-col gap-0 overflow-hidden">
            <div className="p-4">
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
            </div>
            {isAdminOrManager && (
              <div className="flex gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => {
                    setEditingOrder(order);
                    setShowForm(true);
                  }}
                >
                  <EditOutlined />
                  Изменить
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
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
                  <DeleteOutlined />
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6 sticky bottom-5">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 shadow-md rounded-xl px-4 py-2.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <LeftOutlined />
            </Button>
            <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <RightOutlined />
            </Button>
          </div>
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
