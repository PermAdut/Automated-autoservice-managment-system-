import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import './Footer.css';

const Footer = () => {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const canAccess = (roles: string[]) => {
    if (!isAuthenticated || !user) return false;
    return roles.includes(user.roleName);
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2>АвтоСервис</h2>
          <p className="footer-slogan">Ваши машины — наша забота</p>
        </div>
        <nav className="footer-nav">
          <Link to="/dashboard" className="footer-link">Каталог</Link>
          {isAuthenticated && (
            <>
              <Link to="/orders" className="footer-link">Заказы</Link>
              <Link to="/employees" className="footer-link">Рабочие</Link>
              {canAccess(["admin", "manager"]) && (
                <>
                  <Link to="/clients" className="footer-link">Клиенты</Link>
                  <Link to="/suppliers" className="footer-link">Поставки</Link>
                  <Link to="/reports" className="footer-link">Отчёты</Link>
                </>
              )}
            </>
          )}
          <Link to="/about" className="footer-link">О нас</Link>
        </nav>
        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} АвтоСервис. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;