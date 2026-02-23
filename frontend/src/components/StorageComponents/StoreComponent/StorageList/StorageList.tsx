import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ColumnDef } from "@tanstack/react-table";
import { RootState } from "../../../../store";
import {
  useGetSparePartsQuery,
  useCreateSparePartMutation,
  useUpdateSparePartMutation,
  useDeleteSparePartMutation,
  SparePartStock,
  SpareStockPayload,
} from "../../../../api/sparePartsApi";
import { DataTable } from "../../../ui/data-table";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import StorageForm from "../StorageForm/StorageForm";

function getStockVariant(qty: number): "destructive" | "warning" | "success" {
  if (qty === 0) return "destructive";
  if (qty <= 5) return "warning";
  return "success";
}

const StorageList: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const canManage =
    isAuthenticated &&
    (user?.roleName === "admin" || user?.roleName === "manager");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SparePartStock | null>(null);

  const { data: spareParts = [], isLoading, error } = useGetSparePartsQuery({
    search: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  const [createStock] = useCreateSparePartMutation();
  const [updateStock] = useUpdateSparePartMutation();
  const [deleteStock] = useDeleteSparePartMutation();

  const columns: ColumnDef<SparePartStock>[] = [
    {
      accessorFn: (row) => row.sparePart?.name,
      id: "name",
      header: "Запчасть",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">{row.original.sparePart?.name}</p>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{row.original.sparePart?.partNumber}</p>
        </div>
      ),
    },
    {
      accessorFn: (row) => row.sparePart?.category?.name,
      id: "category",
      header: "Категория",
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-500">{(getValue() as string) || "—"}</span>
      ),
    },
    {
      accessorKey: "location",
      header: "Местоположение",
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-700">{(getValue() as string) || "—"}</span>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Количество",
      cell: ({ getValue }) => {
        const qty = getValue() as number;
        return (
          <Badge variant={getStockVariant(qty)}>
            {qty} шт.
          </Badge>
        );
      },
    },
    {
      accessorFn: (row) => row.sparePart?.price,
      id: "price",
      header: "Цена",
      cell: ({ getValue }) => (
        <span className="text-sm font-medium text-gray-700">
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
            cell: ({ row }: { row: { original: SparePartStock } }) => (
              <div className="flex items-center gap-1.5 justify-end">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setEditing(row.original);
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
                    if (!window.confirm("Удалить запись склада?")) return;
                    try {
                      await deleteStock(row.original.sparePart.id).unwrap();
                    } catch (err) {
                      console.error("Failed to delete stock", err);
                    }
                  }}
                >
                  <DeleteOutlined />
                </Button>
              </div>
            ),
          } satisfies ColumnDef<SparePartStock>,
        ]
      : []),
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-3">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
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
        <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
          <InboxOutlined className="text-base" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Склад запчастей</h1>
        </div>
        <span className="ml-auto text-sm text-gray-400 font-medium">{spareParts.length} позиций</span>
        {canManage && (
          <Button
            onClick={() => {
              setEditing(null);
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
        data={spareParts}
        searchPlaceholder="Поиск по названию, артикулу..."
        pageSize={10}
      />

      {canManage && showForm && (
        <StorageForm
          stock={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSubmit={async (payload: SpareStockPayload, sparePartId?: string) => {
            try {
              if (sparePartId) {
                await updateStock({ id: sparePartId, data: payload }).unwrap();
              } else {
                await createStock(payload).unwrap();
              }
              setShowForm(false);
              setEditing(null);
            } catch (err) {
              console.error("Failed to save stock", err);
            }
          }}
        />
      )}
    </div>
  );
};

export default StorageList;
