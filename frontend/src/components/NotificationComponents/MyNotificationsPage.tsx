import { BellOutlined } from "@ant-design/icons";
import { useGetMyNotificationsQuery } from "../../api/notificationsApi";
import { PageLayout } from "../layout/PageLayout";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  channelLabels,
  formatNotificationDate,
  statusLabels,
  statusVariants,
} from "../../utils/notificationLabels";

export default function MyNotificationsPage() {
  const { data: notifications = [], isLoading, error, refetch } = useGetMyNotificationsQuery();

  return (
    <PageLayout className="space-y-6 w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <BellOutlined />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Мои уведомления</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Заказы, подписки на мастеров, гарантия и другие события
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium bg-transparent border-none cursor-pointer"
        >
          Обновить
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center text-red-600">
            Не удалось загрузить уведомления
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BellOutlined className="text-4xl text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">Пока нет уведомлений</p>
            <p className="text-gray-400 text-sm mt-1">
              Они появятся при создании заказа, смене статуса и других событиях
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <h2 className="font-semibold text-gray-900 text-base leading-snug">
                    {item.subject || "Уведомление"}
                  </h2>
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    <Badge variant="secondary">{channelLabels[item.channel]}</Badge>
                    <Badge variant={statusVariants[item.status]}>
                      {statusLabels[item.status]}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.body}</p>
                <p className="text-xs text-gray-400 mt-3">
                  {formatNotificationDate(item.sentAt ?? item.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
