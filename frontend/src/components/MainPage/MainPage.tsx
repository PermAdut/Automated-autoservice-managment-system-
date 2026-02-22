import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const cardClass =
  "p-5 bg-white border-2 border-gray-300 rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md hover:border-blue-600 hover:-translate-y-1";

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const isAdminOrManager =
    user?.roleName === "admin" || user?.roleName === "manager";

  if (!isAuthenticated) {
    return (
      <div className="px-6 py-10 max-w-[1200px] mx-auto min-h-[calc(100vh-160px)] flex flex-col items-center">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Добро пожаловать в AutoService</h1>
          <p className="text-xl text-gray-500 m-0">
            Войдите в систему для доступа к функциям
          </p>
        </header>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-[1200px] mx-auto min-h-[calc(100vh-160px)] flex flex-col items-center">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Добро пожаловать в AutoService</h1>
        <p className="text-xl text-gray-500 m-0">
          Управляйте заказами, сотрудниками и складом в одном месте
        </p>
      </header>

      <section className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 w-full">
        <div className={cardClass} onClick={() => navigate("/employees")}>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Сотрудники</h2>
          <p className="text-base text-gray-500 m-0">
            Просмотр и управление списком сотрудников
          </p>
        </div>
        <div className={cardClass} onClick={() => navigate("/orders")}>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Заказы</h2>
          <p className="text-base text-gray-500 m-0">
            Отслеживание текущих и завершённых заказов
          </p>
        </div>
        {isAdminOrManager && (
          <>
            <div className={cardClass} onClick={() => navigate("/services")}>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Услуги</h2>
              <p className="text-base text-gray-500 m-0">
                Список доступных услуг автосервиса
              </p>
            </div>
            <div className={cardClass} onClick={() => navigate("/stores")}>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Склад</h2>
              <p className="text-base text-gray-500 m-0">
                Управление запасами запчастей
              </p>
            </div>
            <div className={cardClass} onClick={() => navigate("/suppliers")}>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Поставщики</h2>
              <p className="text-base text-gray-500 m-0">
                Информация о поставщиках и закупках
              </p>
            </div>
            <div className={cardClass} onClick={() => navigate("/reports")}>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Отчёты</h2>
              <p className="text-base text-gray-500 m-0">
                Генерация отчётов по деятельности
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default MainPage;
