import { Link, useNavigate } from "react-router-dom";
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <h1>АвтоСервис</h1>
        </div>
        <nav className="header-nav">
          <Link to="/dashboard" className="header-link">Каталог</Link>
          <Link to="/orders" className="header-link">Заказы</Link>
          <Link to="/clients" className="header-link">Клиенты</Link>
          <Link to="/employees" className="header-link">Рабочие</Link>
          <Link to="/suppliers" className="header-link">Поставки</Link>
          <Link to="/reports" className="header-link">Отчёты</Link>
        </nav>
        {/* <div className="header-user">
          <div className="header-placeholder">*Заглушка*</div>
          <button
            onClick={() => console.log("Logout clicked")}
            className="header-logout"
          >
            Выйти
          </button>
        </div> */}
      </div>
    </header>
  );
};

export default Header;