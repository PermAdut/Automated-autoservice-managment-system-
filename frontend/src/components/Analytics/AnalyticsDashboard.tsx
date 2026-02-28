import { useState } from "react";
import {
  FileTextOutlined,
  DollarOutlined,
  UserAddOutlined,
  StarOutlined,
  RiseOutlined,
  FallOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  useGetDashboardKpiQuery,
  useGetOrdersByStatusQuery,
  useGetRevenueByMonthQuery,
  useGetTopServicesQuery,
  useGetLowStockQuery,
} from "../../api/analyticsApi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import { PageLayout } from "../layout/PageLayout";

type Period = "today" | "week" | "month" | "year";

const periodLabels: Record<Period, string> = {
  today: "Сегодня",
  week: "7 дней",
  month: "Месяц",
  year: "Год",
};

const statusConfig: Record<string, { label: string; variant: "success" | "info" | "secondary" | "destructive" | "warning" | "purple" }> = {
  pending: { label: "Ожидание", variant: "warning" },
  in_progress: { label: "В работе", variant: "info" },
  completed: { label: "Завершён", variant: "success" },
  cancelled: { label: "Отменён", variant: "destructive" },
  confirmed: { label: "Подтверждён", variant: "purple" },
};

interface KpiCardProps {
  title: string;
  value: number;
  growth: number | null;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  iconBg: string;
}

function KpiCard({ title, value, growth, prefix = "", suffix = "", icon, iconBg }: KpiCardProps) {
  const positive = growth !== null && growth >= 0;
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-base", iconBg)}>
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900 leading-none">
          {prefix}
          {typeof value === "number" ? value.toLocaleString("ru-RU") : value}
          {suffix}
        </p>
        {growth !== null && (
          <div className="mt-2.5 flex items-center gap-1.5 text-sm">
            {positive ? (
              <RiseOutlined className="text-green-500" />
            ) : (
              <FallOutlined className="text-red-500" />
            )}
            <span className={positive ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
              {positive ? "+" : ""}
              {growth}%
            </span>
            <span className="text-gray-400">vs предыдущий период</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>("month");

  const { data: kpi, isLoading: kpiLoading } = useGetDashboardKpiQuery(period);
  const { data: byStatus } = useGetOrdersByStatusQuery();
  const { data: revenue } = useGetRevenueByMonthQuery();
  const { data: topServices } = useGetTopServicesQuery();
  const { data: lowStock } = useGetLowStockQuery();

  return (
    <PageLayout className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BarChartOutlined className="text-indigo-600 text-xl" />
          <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
        </div>
        <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl">
          {(Object.keys(periodLabels) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer border-none",
                period === p
                  ? "bg-white text-indigo-700 shadow-sm font-semibold"
                  : "text-gray-500 bg-transparent hover:text-gray-700"
              )}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      {kpiLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-32" />
          ))}
        </div>
      ) : kpi ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Заказы"
            value={kpi.orders.current}
            growth={kpi.orders.growth}
            icon={<FileTextOutlined />}
            iconBg="bg-indigo-50 text-indigo-600"
          />
          <KpiCard
            title="Выручка"
            value={kpi.revenue.current}
            growth={kpi.revenue.growth}
            suffix=" ₽"
            icon={<DollarOutlined />}
            iconBg="bg-green-50 text-green-600"
          />
          <KpiCard
            title="Новые клиенты"
            value={kpi.newUsers.current}
            growth={kpi.newUsers.growth}
            icon={<UserAddOutlined />}
            iconBg="bg-blue-50 text-blue-600"
          />
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-gray-500">Средний рейтинг</p>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 text-amber-500">
                  <StarOutlined />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {kpi.averageRating ? kpi.averageRating : "—"}
              </p>
              {kpi.averageRating && (
                <div className="mt-2.5 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarOutlined
                      key={s}
                      className={s <= Math.round(Number(kpi.averageRating ?? 0)) ? "text-amber-400" : "text-gray-200"}
                      style={{ fontSize: 14 }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Orders by Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AppstoreOutlined className="text-indigo-500" />
              Заказы по статусам
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {byStatus?.length ? (
              <div className="space-y-3">
                {byStatus.map((item) => {
                  const cfg = statusConfig[item.status];
                  return (
                    <div key={item.status} className="flex items-center justify-between">
                      <Badge variant={cfg?.variant ?? "secondary"}>
                        {cfg?.label ?? item.status}
                      </Badge>
                      <span className="font-semibold text-gray-900 tabular-nums">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-sm py-4 text-center">Нет данных</p>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Month */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChartOutlined className="text-indigo-500" />
              Выручка по месяцам
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {revenue?.length ? (
              <div className="space-y-2.5">
                {revenue.slice(-6).map((item) => {
                  const max = Math.max(...revenue.map((r) => Number(r.revenue)));
                  const pct = max > 0 ? (Number(item.revenue) / max) * 100 : 0;
                  return (
                    <div key={item.month} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-14 shrink-0 font-medium">
                        {item.month}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-24 text-right tabular-nums">
                        {Number(item.revenue).toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-sm py-4 text-center">Нет данных</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Services */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AppstoreOutlined className="text-indigo-500" />
              Топ услуг
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {topServices?.length ? (
              <div className="divide-y divide-gray-100">
                {topServices.slice(0, 8).map((s, i) => (
                  <div key={s.serviceId} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center",
                          i === 0
                            ? "bg-amber-100 text-amber-700"
                            : i === 1
                            ? "bg-gray-200 text-gray-600"
                            : i === 2
                            ? "bg-orange-100 text-orange-600"
                            : "bg-gray-50 text-gray-400"
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{s.name}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {s.orderCount} заказов
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm py-4 text-center">Нет данных</p>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <WarningOutlined className="text-orange-500" />
              Низкий остаток
            </CardTitle>
            <p className="text-xs text-gray-400">Запчасти с остатком ≤ 5 шт.</p>
          </CardHeader>
          <CardContent className="pt-0">
            {lowStock?.length ? (
              <div className="divide-y divide-gray-100">
                {lowStock.map((item) => (
                  <div key={item.sparePartId} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.partNumber}</p>
                    </div>
                    <Badge
                      variant={Number(item.totalQuantity) === 0 ? "destructive" : "warning"}
                    >
                      {item.totalQuantity} шт.
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-green-600 text-sm font-medium">Все позиции в норме ✓</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
