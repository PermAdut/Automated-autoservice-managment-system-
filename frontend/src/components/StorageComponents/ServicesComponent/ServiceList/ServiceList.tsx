import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ColumnDef } from "@tanstack/react-table";
import { RootState } from "../../../../store";
import {
  useGetServicesQuery,
  useDeleteServiceMutation,
  Service,
} from "../../../../api/servicesApi";
import { DataTable } from "../../../ui/data-table";
import { Button } from "../../../ui/button";
import { ServiceForm } from "../ServiceForm/ServiceForm";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ToolOutlined,
} from "@ant-design/icons";

const ServiceList: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const canManage =
    isAuthenticated &&
    (user?.roleName === "admin" || user?.roleName === "manager");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: services = [], isLoading, error } = useGetServicesQuery({
    search: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  const [deleteService] = useDeleteServiceMutation();

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
            <ToolOutlined className="text-sm" />
          </div>
          <p className="font-medium text-gray-900">{row.original.name}</p>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Описание",
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-500 line-clamp-2">
          {(getValue() as string) || "—"}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: "Цена",
      cell: ({ getValue }) => (
        <span className="text-sm font-semibold text-gray-800">
          {Number(getValue() || 0).toLocaleString("ru-RU")} ₽
        </span>
      ),
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "",
            enableSorting: false,
            cell: ({ row }: { row: { original: Service } }) => (
              <div className="flex items-center gap-1.5 justify-end">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setEditingId(row.original.id);
                    setShowForm(true);
                  }}
                >
                  <EditOutlined />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={async () => {
                    if (!window.confirm("Удалить услугу?")) return;
                    try {
                      await deleteService(row.original.id).unwrap();
                    } catch (err) {
                      console.error("Failed to delete service", err);
                    }
                  }}
                >
                  <DeleteOutlined />
                </Button>
              </div>
            ),
          } satisfies ColumnDef<Service>,
        ]
      : []),
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-3">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-10 text-red-500 font-medium">
          Ошибка загрузки данных
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-20 max-w-7xl mx-auto">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          <ToolOutlined className="text-base" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Услуги</h1>
        <span className="ml-auto text-sm text-gray-400 font-medium">{services.length} услуг</span>
        {canManage && (
          <Button
            onClick={() => {
              setEditingId(null);
              setShowForm(true);
            }}
          >
            <PlusOutlined className="mr-1.5" />
            Добавить
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={services}
        searchPlaceholder="Поиск по названию..."
        pageSize={10}
      />

      {canManage && showForm && (
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
