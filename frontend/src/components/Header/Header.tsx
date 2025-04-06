import React from "react";
import { Link } from "react-router-dom";
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <h1>АвтоСервис</h1>
        </div>
        <nav className="header-nav">
          <Link to="/dashboard" className="header-link">Каталог</Link>
          <Link to="/orders" className="header-link">Заказы</Link>
          <Link to="/clients" className="header-link">Клиенты</Link>
          <Link to="/employees" className="header-link">Рабочие</Link>
        </nav>
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