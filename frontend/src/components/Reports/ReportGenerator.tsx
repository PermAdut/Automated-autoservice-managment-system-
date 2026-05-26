import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ModalOverlay } from "../ui/modal-overlay";
import { useLazyGetReportQuery } from "../../api/reportsApi";
import type { ReportData } from "../../api/reportsApi";
import { Card, CardContent } from "../ui/card";
import { PageLayout } from "../layout/PageLayout";
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
  DownloadOutlined,
  FilePdfOutlined,
  CalendarOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { serverConfig } from "../../configs/serverConfig";

const getExportUrl = (type: string, format: "csv" | "pdf") =>
  `${serverConfig.url}/api/v1.0/reports/${type}/${format}`;

const reportTypes = [
  { type: "orders", label: "Заказы клиентов", icon: <FileTextOutlined />, color: "bg-indigo-50 text-indigo-600" },
  { type: "stock", label: "Запасы склада", icon: <InboxOutlined />, color: "bg-orange-50 text-orange-500" },
  { type: "services", label: "Доходы по услугам", icon: <ToolOutlined />, color: "bg-green-50 text-green-600" },
  { type: "employees", label: "Работа сотрудников", icon: <TeamOutlined />, color: "bg-blue-50 text-blue-600" },
  { type: "subscriptions", label: "Подписки и отзывы", icon: <StarOutlined />, color: "bg-amber-50 text-amber-500" },
];

const parseSchedule = (value: unknown): string[] => {
  const text = String(value ?? "");
  if (!text || text === "-") {
    return [];
  }
  return text.split("\n");
};

const ScheduleCell: React.FC<{
  value: unknown;
  onOpen: () => void;
}> = ({ value, onOpen }) => {
  const entries = parseSchedule(value);
  if (entries.length === 0) {
    return <>—</>;
  }

  const shiftLabel =
    entries.length === 1
      ? "1 смена"
      : entries.length < 5
        ? `${entries.length} смены`
        : `${entries.length} смен`;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
    >
      <CalendarOutlined />
      {shiftLabel}
    </button>
  );
};

const ScheduleModal: React.FC<{
  isOpen: boolean;
  employeeName: string;
  positionName?: string;
  entries: string[];
  onClose: () => void;
}> = ({ isOpen, employeeName, positionName, entries, onClose }) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <ModalOverlay onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Расписание</h3>
            <p className="mt-0.5 text-sm text-gray-600">{employeeName}</p>
            {positionName && (
              <p className="text-xs text-gray-400">{positionName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Закрыть"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {entries.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Нет записей расписания
            </p>
          ) : (
            <ul className="space-y-2">
              {entries.map((entry, index) => (
                <li
                  key={index}
                  className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-800"
                >
                  {entry}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-gray-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Закрыть
          </button>
        </div>
      </div>
    </ModalOverlay>,
    document.body,
  );
};

const ReportTable: React.FC<{ data: ReportData }> = ({ data }) => {
  const [scheduleModal, setScheduleModal] = useState<{
    employeeName: string;
    positionName?: string;
    entries: string[];
  } | null>(null);

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
                    {col.key === "schedule" ? (
                      <ScheduleCell
                        value={row[col.key]}
                        onOpen={() =>
                          setScheduleModal({
                            employeeName: String(row.employee_name ?? "Сотрудник"),
                            positionName: String(row.position_name ?? ""),
                            entries: parseSchedule(row[col.key]),
                          })
                        }
                      />
                    ) : (
                      String(row[col.key] ?? "—")
                    )}
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

      <ScheduleModal
        isOpen={scheduleModal !== null}
        employeeName={scheduleModal?.employeeName ?? ""}
        positionName={scheduleModal?.positionName}
        entries={scheduleModal?.entries ?? []}
        onClose={() => setScheduleModal(null)}
      />
    </div>
  );
};

const ReportGenerator: React.FC = () => {
  const [fetchReport, { data, isLoading, error, originalArgs }] =
    useLazyGetReportQuery();

  return (
    <PageLayout className="pb-20">
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
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <span className="text-sm text-gray-500">{data.rows.length} строк</span>
              <div className="flex gap-2">
                <a
                  href={getExportUrl(originalArgs!, "csv")}
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 no-underline transition-colors"
                >
                  <DownloadOutlined />
                  CSV
                </a>
                <a
                  href={getExportUrl(originalArgs!, "pdf")}
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 no-underline transition-colors"
                >
                  <FilePdfOutlined />
                  PDF
                </a>
              </div>
            </div>
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
    </PageLayout>
  );
};

export default ReportGenerator;
