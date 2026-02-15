import React from "react";
import { useLazyGetReportQuery } from "../../api/reportsApi";
import type { ReportData } from "../../api/reportsApi";

const reportTypes = [
  { type: "orders", label: "Отчёт о заказах клиентов" },
  { type: "stock", label: "Отчёт о запасах на складах" },
  { type: "services", label: "Отчёт о доходах по услугам" },
  { type: "employees", label: "Отчёт о работе сотрудников" },
  { type: "subscriptions", label: "Отчёт о подписках и отзывах клиентов" },
];

const ReportTable: React.FC<{ data: ReportData }> = ({ data }) => {
  if (data.rows.length === 0) {
    return <p className="text-center py-5 italic text-gray-400">Нет данных для отчёта</p>;
  }

  return (
    <>
      <h2 className="text-center text-gray-800 my-5 text-xl font-semibold">{data.title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse shadow-md">
          <thead>
            <tr>
              {data.columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-3 text-left border border-gray-200 text-sm font-bold bg-primary text-white"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, idx) => (
              <tr key={idx} className="even:bg-gray-50 hover:bg-blue-50 transition-colors">
                {data.columns.map((col) => (
                  <td key={col.key} className="px-3 py-3 text-left border border-gray-200 text-sm">
                    {String(row[col.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const ReportGenerator: React.FC = () => {
  const [fetchReport, { data, isLoading, error }] = useLazyGetReportQuery();

  return (
    <div className="max-w-7xl mx-auto px-5 py-5">
      <h1 className="text-3xl text-center text-gray-800 mb-8 uppercase font-bold">
        Генератор отчётов
      </h1>
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        {reportTypes.map((report) => (
          <button
            key={report.type}
            className="bg-primary text-white border-none px-6 py-3 text-base rounded-lg cursor-pointer transition-all hover:bg-primary-dark hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            onClick={() => fetchReport(report.type)}
            disabled={isLoading}
          >
            {report.label}
          </button>
        ))}
      </div>

      {isLoading && <div className="text-center text-lg text-gray-400 my-5">Загрузка отчёта...</div>}
      {error && <div className="text-center text-lg text-red-500 my-5">Не удалось загрузить отчёт. Проверьте соединение с сервером.</div>}
      {data && (
        <div className="bg-white rounded-lg shadow-lg p-5">
          <ReportTable data={data} />
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
