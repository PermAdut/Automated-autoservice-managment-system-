import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Invoice,
  InvoiceStatus,
  useCreateInvoiceMutation,
  useDeleteInvoiceMutation,
  useGetInvoicesByPositionQuery,
  useUpdateInvoiceMutation,
} from "../../../api/suppliersApi";
import { DataTable } from "../../ui/data-table";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";

const invoiceStatusConfig: Record<
  InvoiceStatus,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  paid: { label: "Оплачен", variant: "success" },
  pending: { label: "Ожидает", variant: "warning" },
  overdue: { label: "Просрочен", variant: "destructive" },
};

const invoiceStatusOptions: { value: InvoiceStatus; label: string }[] = [
  { value: "pending", label: "Ожидает" },
  { value: "paid", label: "Оплачен" },
  { value: "overdue", label: "Просрочен" },
];

interface PositionInvoicesProps {
  positionId: string;
  canManage: boolean;
  canDelete: boolean;
}

export function PositionInvoices({
  positionId,
  canManage,
  canDelete,
}: PositionInvoicesProps) {
  const { data: invoices = [], isLoading, error } = useGetInvoicesByPositionQuery(positionId);
  const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();
  const [deleteInvoice] = useDeleteInvoiceMutation();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    amount: "",
    status: "pending" as InvoiceStatus,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    status: "pending" as InvoiceStatus,
  });

  const handleCreate = async () => {
    const amount = Number(createForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;

    try {
      await createInvoice({
        positionForBuyingId: positionId,
        amount,
        status: createForm.status,
      }).unwrap();
      setCreateForm({ amount: "", status: "pending" });
      setShowCreateForm(false);
    } catch (err) {
      console.error("Failed to create invoice", err);
    }
  };

  const startEdit = (invoice: Invoice) => {
    setEditingId(invoice.id);
    setEditForm({
      amount: invoice.amount,
      status: (invoice.status as InvoiceStatus) || "pending",
    });
  };

  const handleUpdate = async (invoiceId: string) => {
    const amount = Number(editForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;

    try {
      await updateInvoice({
        id: invoiceId,
        positionId,
        data: {
          amount,
          status: editForm.status,
        },
      }).unwrap();
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update invoice", err);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (!window.confirm("Удалить счёт?")) return;

    try {
      await deleteInvoice({ id: invoiceId, positionId }).unwrap();
    } catch (err) {
      console.error("Failed to delete invoice", err);
    }
  };

  const columns: ColumnDef<Invoice>[] = useMemo(
    () => [
      {
        accessorKey: "invoiceDate",
        header: "Дата",
        cell: ({ row }) =>
          new Date(row.original.invoiceDate).toLocaleDateString("ru-RU"),
      },
      {
        accessorKey: "amount",
        header: "Сумма",
        cell: ({ row }) => {
          if (editingId === row.original.id) {
            return (
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, amount: e.target.value }))
                }
                className="h-8 w-28"
              />
            );
          }

          return `${parseFloat(row.original.amount).toLocaleString("ru-RU")} ₽`;
        },
      },
      {
        accessorKey: "status",
        header: "Статус",
        cell: ({ row }) => {
          if (editingId === row.original.id) {
            return (
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    status: e.target.value as InvoiceStatus,
                  }))
                }
                className="h-8 rounded-md border border-gray-200 px-2 text-sm"
              >
                {invoiceStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            );
          }

          const cfg =
            invoiceStatusConfig[row.original.status as InvoiceStatus] ?? {
              label: row.original.status,
              variant: "warning" as const,
            };

          return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          if (!canManage && !canDelete) return null;

          if (editingId === row.original.id) {
            return (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleUpdate(row.original.id)}
                  disabled={isUpdating}
                >
                  <SaveOutlined />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditingId(null)}
                >
                  Отмена
                </Button>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-end gap-1.5">
              {canManage && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => startEdit(row.original)}
                >
                  <EditOutlined />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(row.original.id)}
                >
                  <DeleteOutlined />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [
      canDelete,
      canManage,
      editForm.amount,
      editForm.status,
      editingId,
      isUpdating,
    ]
  );

  if (isLoading) {
    return <p className="text-sm text-gray-400">Загрузка счетов...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Не удалось загрузить счета</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-gray-700">
          Счета ({invoices.length})
        </h4>
        {canManage && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCreateForm((prev) => !prev)}
          >
            <PlusOutlined className="mr-1" />
            Добавить счёт
          </Button>
        )}
      </div>

      {showCreateForm && canManage && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg border border-gray-200 bg-white">
          <div className="space-y-1.5">
            <Label htmlFor={`amount-${positionId}`}>Сумма</Label>
            <Input
              id={`amount-${positionId}`}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="15000"
              value={createForm.amount}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, amount: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`status-${positionId}`}>Статус</Label>
            <select
              id={`status-${positionId}`}
              value={createForm.status}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  status: e.target.value as InvoiceStatus,
                }))
              }
              className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              {invoiceStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Сохранение..." : "Сохранить"}
            </Button>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Отмена
            </Button>
          </div>
        </div>
      )}

      {invoices.length > 0 ? (
        <DataTable
          columns={columns}
          data={invoices}
          searchPlaceholder="Поиск по счетам..."
          pageSize={5}
        />
      ) : (
        <p className="text-sm text-gray-400">Счета пока не добавлены</p>
      )}
    </div>
  );
}
