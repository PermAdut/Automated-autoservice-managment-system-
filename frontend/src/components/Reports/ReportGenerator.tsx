import React, { useState } from "react";
import axios from "axios";
import "./ReportGenerator.css";
import { serverConfig } from "../../configs/serverConfig";

const ReportGenerator: React.FC = () => {
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportTypes = [
    { type: "orders", label: "Отчёт о заказах клиентов" },
    { type: "stock", label: "Отчёт о запасах на складах" },
    { type: "services", label: "Отчёт о доходах по услугам" },
    { type: "employees", label: "Отчёт о работе сотрудников" },
    { type: "subscriptions", label: "Отчёт о подписках и отзывах клиентов" },
  ];

  const fetchReport = async (type: string) => {
    setIsLoading(true);
    setError(null);
    setReportHtml(null);

    try {
      const response = await axios.get(
        `${serverConfig.url}/api/v1.0/reports/${type}`,
        {
          responseType: "text",
        }
      );
      console.log("Fetched report HTML:", response.data);
      setReportHtml(response.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Не удалось загрузить отчёт. Проверьте соединение с сервером.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="report-generator">
      <h1 className="report-title">Генератор отчётов</h1>
      <div className="report-buttons">
        {reportTypes.map((report) => (
          <button
            key={report.type}
            className="report-button"
            onClick={() => fetchReport(report.type)}
            disabled={isLoading}
          >
            {report.label}
          </button>
        ))}
      </div>

      {isLoading && <div className="report-loading">Загрузка отчёта...</div>}
      {error && <div className="report-error">{error}</div>}
      {reportHtml && (
        <div
          className="report-content"
          dangerouslySetInnerHTML={{ __html: reportHtml }}
        />
      )}
    </div>
  );
};

export default ReportGenerator;
