import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { logout } from "../../store/slices/authSlice";
import { useLogoutMutation } from "../../api/authApi";
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await logoutMutation({ refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const canAccess = (roles: string[]) => {
    if (!isAuthenticated || !user) return false;
    return roles.includes(user.roleName);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <h1>АвтоСервис</h1>
        </div>
        <nav className="header-nav">
          <Link to="/dashboard" className="header-link">Каталог</Link>
          {isAuthenticated && (
            <>
              <Link to="/orders" className="header-link">Заказы</Link>
              {canAccess(['admin', 'manager']) && (
                <>
                  <Link to="/clients" className="header-link">Клиенты</Link>
                  <Link to="/employees" className="header-link">Рабочие</Link>
                  <Link to="/suppliers" className="header-link">Поставки</Link>
                  <Link to="/reports" className="header-link">Отчёты</Link>
                </>
              )}
            </>
          )}
          <Link to="/about" className="header-link">О нас</Link>
        </nav>
        <div className="header-user">
          {isAuthenticated && user ? (
            <>
              <div className="header-user-info">
                <span className="header-user-name">{user.name} {user.surName}</span>
                <span className="header-user-role">{user.roleName}</span>
              </div>
              <button onClick={handleLogout} className="header-logout">
                Выйти
              </button>
            </>
          ) : (
            <Link to="/login" className="header-login-button">
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;