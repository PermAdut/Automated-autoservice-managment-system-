import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  useGetSuppliersQuery,
  useDeleteSupplierMutation,
  Supplier,
} from "../../../api/suppliersApi";
import { DataTable } from "../../ui/data-table";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import SupplierForm from "../SupplierForm/SupplierForm";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const SupplierList: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    data: suppliers = [],
    isLoading,
    error,
  } = useGetSuppliersQuery({
    search: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  const [deleteSupplier] = useDeleteSupplierMutation();

  const editingSupplier = useMemo(
    () => suppliers.find((s) => s.id === editingId),
    [editingId, suppliers]
  );

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "name",
      header: "Поставщик",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
            <ShopOutlined className="text-sm" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.original.name}</p>
            <p className="text-xs text-gray-400 font-mono">{row.original.id.slice(0, 8)}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "contact",
      header: "Контакт",
      cell: ({ getValue }) => {
        const contact = getValue() as string;
        return contact ? (
          <span className="flex items-center gap-1.5 text-sm text-gray-600">
            <PhoneOutlined className="text-gray-400 text-xs" />
            {contact}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        );
      },
    },
    {
      accessorKey: "address",
      header: "Адрес",
      cell: ({ getValue }) => {
        const address = getValue() as string;
        return address ? (
          <span className="flex items-center gap-1.5 text-sm text-gray-600">
            <EnvironmentOutlined className="text-gray-400 text-xs" />
            {address}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        );
      },
    },
    {
      id: "positions",
      header: "Позиции",
      accessorFn: (row) => row.positionsForBuying?.length ?? 0,
      cell: ({ getValue }) => {
        const count = getValue() as number;
        return count > 0 ? (
          <Badge variant="info">{count} позиций</Badge>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
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
              if (!window.confirm("Удалить поставщика?")) return;
              try {
                await deleteSupplier(row.original.id).unwrap();
              } catch (err) {
                console.error("Failed to delete supplier", err);
              }
            }}
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-3">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
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
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
          <ShopOutlined className="text-base" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Поставщики</h1>
        <span className="ml-auto text-sm text-gray-400 font-medium">{suppliers.length} записей</span>
        <Button
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
        >
          <PlusOutlined className="mr-1.5" />
          Добавить
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        searchPlaceholder="Поиск по названию, контакту..."
        pageSize={10}
      />

      {showForm && (
        <SupplierForm
          initialData={
            editingSupplier ?? { name: "", contact: "", address: "" }
          }
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          supplierId={editingSupplier?.id ?? null}
        />
      )}
    </div>
  );
};

export default SupplierList;
