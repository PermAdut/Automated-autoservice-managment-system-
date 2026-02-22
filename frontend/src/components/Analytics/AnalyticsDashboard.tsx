import {
  useGetDashboardKpiQuery,
  useGetOrdersByStatusQuery,
  useGetRevenueByMonthQuery,
  useGetTopServicesQuery,
  useGetLowStockQuery,
} from "../../api/analyticsApi";
import { useState } from "react";

type Period = "today" | "week" | "month" | "year";

const periodLabels: Record<Period, string> = {
  today: "Сегодня",
  week: "7 дней",
  month: "Месяц",
  year: "Год",
};

const statusLabels: Record<string, string> = {
  pending: "Ожидание",
  in_progress: "В работе",
  completed: "Завершён",
  cancelled: "Отменён",
  confirmed: "Подтверждён",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  confirmed: "bg-indigo-100 text-indigo-800",
};

function KpiCard({
  title,
  value,
  previous,
  growth,
  prefix = "",
  suffix = "",
}: {
  title: string;
  value: number;
  previous: number;
  growth: number | null;
  prefix?: string;
  suffix?: string;
}) {
  const positive = growth !== null && growth >= 0;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">
        {prefix}
        {typeof value === "number" ? value.toLocaleString("ru-RU") : value}
        {suffix}
      </p>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className={positive ? "text-green-600" : "text-red-500"}>
          {growth !== null ? `${positive ? "+" : ""}${growth}%` : "—"}
        </span>
        <span className="text-gray-400">vs предыдущий период</span>
      </div>
    </div>
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
        <div className="flex gap-2">
          {(Object.keys(periodLabels) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
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
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-28" />
          ))}
        </div>
      ) : kpi ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Заказы"
            value={kpi.orders.current}
            previous={kpi.orders.previous}
            growth={kpi.orders.growth}
          />
          <KpiCard
            title="Выручка"
            value={kpi.revenue.current}
            previous={kpi.revenue.previous}
            growth={kpi.revenue.growth}
            suffix=" ₽"
          />
          <KpiCard
            title="Новые клиенты"
            value={kpi.newUsers.current}
            previous={kpi.newUsers.previous}
            growth={kpi.newUsers.growth}
          />
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500 mb-1">Средний рейтинг</p>
            <p className="text-3xl font-bold text-gray-900">
              {kpi.averageRating ? `${kpi.averageRating} ★` : "—"}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Заказы по статусам</h2>
          {byStatus?.length ? (
            <div className="space-y-3">
              {byStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[item.status] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {statusLabels[item.status] ?? item.status}
                  </span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Нет данных</p>
          )}
        </div>

        {/* Revenue by Month */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Выручка по месяцам</h2>
          {revenue?.length ? (
            <div className="space-y-2">
              {revenue.slice(-6).map((item) => {
                const max = Math.max(...revenue.map((r) => Number(r.revenue)));
                const pct = max > 0 ? (Number(item.revenue) / max) * 100 : 0;
                return (
                  <div key={item.month} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16 shrink-0">{item.month}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-20 text-right">
                      {Number(item.revenue).toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Нет данных</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Топ услуг</h2>
          {topServices?.length ? (
            <div className="divide-y divide-gray-100">
              {topServices.slice(0, 8).map((s, i) => (
                <div key={s.serviceId} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-5">{i + 1}</span>
                    <span className="text-sm font-medium text-gray-800">{s.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{s.orderCount} заказов</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Нет данных</p>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Низкий остаток
          </h2>
          <p className="text-xs text-gray-400 mb-4">Запчасти с остатком ≤ 5 шт.</p>
          {lowStock?.length ? (
            <div className="divide-y divide-gray-100">
              {lowStock.map((item) => (
                <div key={item.sparePartId} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.partNumber}</p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      Number(item.totalQuantity) === 0
                        ? "text-red-600"
                        : "text-orange-500"
                    }`}
                  >
                    {item.totalQuantity} шт.
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-600 text-sm">Все позиции в норме ✓</p>
          )}
        </div>
      </div>
    </div>
  );
}
