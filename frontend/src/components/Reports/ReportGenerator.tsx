import React from "react";
import { useLazyGetReportQuery } from "../../api/reportsApi";
import type { ReportData } from "../../api/reportsApi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  FileTextOutlined,
  InboxOutlined,
  ToolOutlined,
  TeamOutlined,
  StarOutlined,
  FundOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

const reportTypes = [
  { type: "orders", label: "Заказы клиентов", icon: <FileTextOutlined />, color: "bg-indigo-50 text-indigo-600" },
  { type: "stock", label: "Запасы склада", icon: <InboxOutlined />, color: "bg-orange-50 text-orange-500" },
  { type: "services", label: "Доходы по услугам", icon: <ToolOutlined />, color: "bg-green-50 text-green-600" },
  { type: "employees", label: "Работа сотрудников", icon: <TeamOutlined />, color: "bg-blue-50 text-blue-600" },
  { type: "subscriptions", label: "Подписки и отзывы", icon: <StarOutlined />, color: "bg-amber-50 text-amber-500" },
];

const ReportTable: React.FC<{ data: ReportData }> = ({ data }) => {
  if (data.rows.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <FundOutlined className="text-3xl mb-2 block" />
        Нет данных для отчёта
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{data.title}</h2>
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              {data.columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row, idx) => (
              <TableRow key={idx}>
                {data.columns.map((col) => (
                  <TableCell key={col.key} className="text-sm">
                    {String(row[col.key] ?? "—")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-right">
        Всего строк: {data.rows.length}
      </p>
    </div>
  );
};

const ReportGenerator: React.FC = () => {
  const [fetchReport, { data, isLoading, error, originalArgs }] =
    useLazyGetReportQuery();

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 pb-20">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          <FundOutlined className="text-base" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Отчёты</h1>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-8">
        {reportTypes.map((report) => {
          const isActive = originalArgs === report.type && data;
          return (
            <button
              key={report.type}
              onClick={() => fetchReport(report.type)}
              disabled={isLoading}
              className={`
                group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer
                disabled:opacity-60 disabled:cursor-not-allowed text-left
                ${isActive
                  ? "border-indigo-500 bg-indigo-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                }
              `}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base ${report.color}`}>
                {isLoading && originalArgs === report.type
                  ? <LoadingOutlined />
                  : report.icon
                }
              </div>
              <span className={`text-sm font-medium text-center leading-tight ${isActive ? "text-indigo-700" : "text-gray-700"}`}>
                {report.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Report Output */}
      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <LoadingOutlined className="text-2xl text-indigo-500 animate-spin" />
            <p className="mt-3 text-sm text-gray-400">Загрузка отчёта...</p>
          </CardContent>
        </Card>
      )}

      {error && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500 font-medium">Не удалось загрузить отчёт</p>
            <p className="text-sm text-gray-400 mt-1">Проверьте соединение с сервером</p>
          </CardContent>
        </Card>
      )}

      {data && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <ReportTable data={data} />
          </CardContent>
        </Card>
      )}

      {!data && !isLoading && !error && (
        <div className="text-center py-16 text-gray-400">
          <FundOutlined className="text-5xl mb-3 block" />
          <p className="text-sm">Выберите тип отчёта выше</p>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
