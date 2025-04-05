import React from "react";
import { Link } from "react-router-dom";
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        {/* Логотип */}
        <div className="header-logo">
          <h1>АвтоСервис</h1>
        </div>

        {/* Навигация */}
        <nav className="header-nav">
          <Link to="/dashboard" className="header-link">Машины</Link>
          <Link to="/orders" className="header-link">Заказы</Link>
          <Link to="/clients" className="header-link">Клиенты</Link>
        </nav>

        {/* Блок пользователя и выход */}
        <div className="header-user">
          <div className="header-placeholder">*Заглушка*</div>
          <button
            onClick={() => console.log("Logout clicked")}
            className="header-logout"
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;