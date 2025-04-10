import React from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="main-page-container">
      <header className="main-page-header">
        <h1 className="main-page-title">Добро пожаловать в AutoService</h1>
        <p className="main-page-subtitle">
          Управляйте заказами, сотрудниками и складом в одном месте
        </p>
      </header>

      <section className="main-page-sections">
        <div
          className="main-page-card"
          onClick={() => navigate("/employees")}
        >
          <h2 className="main-page-card-title">Сотрудники</h2>
          <p className="main-page-card-description">
            Просмотр и управление списком сотрудников
          </p>
        </div>
        <div className="main-page-card" onClick={() => navigate("/orders")}>
          <h2 className="main-page-card-title">Заказы</h2>
          <p className="main-page-card-description">
            Отслеживание текущих и завершённых заказов
          </p>
        </div>
        <div className="main-page-card" onClick={() => navigate("/services")}>
          <h2 className="main-page-card-title">Услуги</h2>
          <p className="main-page-card-description">
            Список доступных услуг автосервиса
          </p>
        </div>
        <div className="main-page-card" onClick={() => navigate("/stores")}>
          <h2 className="main-page-card-title">Склад</h2>
          <p className="main-page-card-description">
            Управление запасами запчастей
          </p>
        </div>
        <div
          className="main-page-card"
          onClick={() => navigate("/suppliers")}
        >
          <h2 className="main-page-card-title">Поставщики</h2>
          <p className="main-page-card-description">
            Информация о поставщиках и закупках
          </p>
        </div>
      </section>
    </div>
  );
};

export default MainPage;