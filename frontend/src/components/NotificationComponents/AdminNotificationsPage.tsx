import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { BellOutlined } from "@ant-design/icons";
import { useGetAllNotificationsQuery, type AdminNotification } from "../../api/notificationsApi";
import { PageLayout } from "../layout/PageLayout";
import { DataTable } from "../ui/data-table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  channelLabels,
  formatNotificationDate,
  statusLabels,
  statusVariants,
} from "../../utils/notificationLabels";

export default function AdminNotificationsPage() {
  const { data: notifications = [], isLoading, error, refetch } = useGetAllNotificationsQuery();

  const columns = useMemo<ColumnDef<AdminNotification>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Дата",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {formatNotificationDate(row.original.sentAt ?? row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "user",
        header: "Пользователь",
        cell: ({ row }) => {
          const name = [row.original.userName, row.original.userSurName]
            .filter(Boolean)
            .join(" ");
          return (
            <div className="min-w-[140px]">
              <p className="text-sm font-medium text-gray-900">{name || "—"}</p>
              {row.original.userEmail && (
                <p className="text-xs text-gray-400">{row.original.userEmail}</p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "subject",
        header: "Тема",
        cell: ({ row }) => (
          <span className="text-sm text-gray-900">
            {row.original.subject || "—"}
          </span>
        ),
      },
      {
        accessorKey: "body",
        header: "Текст",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600 line-clamp-2 max-w-md">
            {row.original.body}
          </span>
        ),
      },
      {
        accessorKey: "channel",
        header: "Канал",
        cell: ({ row }) => (
          <Badge variant="secondary">{channelLabels[row.original.channel]}</Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Статус",
        cell: ({ row }) => (
          <Badge variant={statusVariants[row.original.status]}>
            {statusLabels[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "recipient",
        header: "Получатель",
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 font-mono">{row.original.recipient}</span>
        ),
      },
    ],
    []
  );

  return (
    <PageLayout className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <BellOutlined />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Все уведомления</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Журнал in-app и email-уведомлений по всем пользователям
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Обновить
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/notifications">Мои уведомления</Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      ) : error ? (
        <div className="py-12 text-center text-red-600">
          Не удалось загрузить уведомления
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={notifications}
          searchPlaceholder="Поиск по теме, тексту, email..."
          pageSize={15}
        />
      )}
    </PageLayout>
  );
}
