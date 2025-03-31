import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="shadow-lg bg-gradient-to-r from-indigo-600 to-blue-500">
      <div className="container flex items-center justify-between px-8 py-4 mx-auto">
        {/* Логотип */}
        <div className="flex items-center">
          <h1 className="text-3xl font-extrabold tracking-wide text-white">
            АвтоСервис
          </h1>
        </div>

        <nav className="flex justify-between w-1/2">
          <Link
            to="/dashboard"
            className="text-xl font-bold tracking-wide text-gray-100 no-underline transition-transform transform hover:text-white hover:scale-110"
          >
            Машины
          </Link>
          <Link
            to="/orders"
            className="text-xl font-bold tracking-wide text-gray-100 no-underline transition-transform transform hover:text-white hover:scale-110"
          >
            Заказы
          </Link>
          <Link
            to="/clients"
            className="text-xl font-bold tracking-wide text-gray-100 no-underline transition-transform transform hover:text-white hover:scale-110"
          >
            Клиенты
          </Link>
        </nav>

        {/* Блок пользователя и выход */}
        <div className="flex items-center space-x-6">
          <div className="text-lg font-semibold text-white">*Заглушка*</div>

          <button
            onClick={() => {
              console.log("Logout clicked");
            }}
            className="px-5 py-2 font-semibold text-white transition-transform transform bg-red-500 rounded-lg shadow-md hover:bg-red-600 hover:scale-105"
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
