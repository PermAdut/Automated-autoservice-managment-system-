import { Link } from "react-router-dom";
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2>АвтоСервис</h2>
          <p className="footer-slogan">Ваши машины — наша забота</p>
        </div>
        <nav className="footer-nav">
          <Link to="/dashboard" className="footer-link">Каталог</Link>
          <Link to="/orders" className="footer-link">Заказы</Link>
          <Link to="/clients" className="footer-link">Клиенты</Link>
          <Link to="/employees" className="footer-link">Рабочие</Link>
        </nav>
        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} АвтоСервис. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;