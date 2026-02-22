import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { logout } from "../../store/slices/authSlice";
import { useLogoutMutation } from "../../api/baseApi";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const [logoutMutation] = useLogoutMutation();
  const companyName = useSelector((state: RootState) => state.tenant.branding?.companyName ?? "АвтоСервис");
  const featureOnlineBooking = useSelector((state: RootState) => state.tenant.branding?.features?.onlineBooking ?? true);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await logoutMutation({ refresh_token: refreshToken }).unwrap();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  const canAccess = (roles: string[]) => {
    if (!isAuthenticated || !user) return false;
    return roles.includes(user.roleName);
  };

  return (
    <header className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-500 shadow-md sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <div
          className="cursor-pointer"
          onClick={() => navigate("/")}
        >
          <h1 className="text-[1.875rem] font-extrabold text-white m-0 [text-shadow:0_2px_4px_rgba(0,0,0,0.1)] sm:text-2xl">
            {companyName}
          </h1>
        </div>

        <nav className="flex flex-wrap order-3 w-full justify-center gap-4 text-sm md:order-none md:w-auto md:justify-start md:gap-5 md:text-base lg:gap-10">
          <Link
            to="/dashboard"
            className="font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
          >
            Каталог
          </Link>
          {isAuthenticated && (
            <>
              {featureOnlineBooking && (
                <Link
                  to="/booking"
                  className="font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
                >
                  Запись
                </Link>
              )}
              <Link
                to="/orders"
                className="font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
              >
                Заказы
              </Link>
              <Link
                to="/employees"
                className="font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
              >
                Рабочие
              </Link>
              {canAccess(["admin", "manager"]) && (
                <>
                  <Link
                    to="/clients"
                    className="font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
                  >
                    Клиенты
                  </Link>
                  <Link
                    to="/suppliers"
                    className="font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
                  >
                    Поставки
                  </Link>
                  <Link
                    to="/reports"
                    className="font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
                  >
                    Отчёты
                  </Link>
                  <Link
                    to="/analytics"
                    className="font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
                  >
                    Аналитика
                  </Link>
                </>
              )}
              {canAccess(["admin"]) && (
                <Link
                  to="/settings"
                  className="font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
                >
                  Настройки
                </Link>
              )}
            </>
          )}
          <Link
            to="/about"
            className="font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
          >
            О нас
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <div className="hidden sm:flex flex-col items-end gap-1">
                <Link to="/profile" className="flex flex-col no-underline cursor-pointer transition-all duration-300 hover:opacity-80">
                  <span className="text-sm font-semibold text-white">
                    {user.name} {user.surName}
                  </span>
                  <span className="text-xs text-indigo-200 capitalize">{user.roleName}</span>
                </Link>
              </div>
              <button
                onClick={handleLogout}
                className="py-2 px-5 bg-red-600 text-white font-semibold border-none rounded-lg shadow-sm cursor-pointer transition-all duration-300 hover:bg-red-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Выйти
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="py-2 px-5 bg-white/20 text-white font-semibold border-2 border-white/30 rounded-lg no-underline transition-all duration-300 hover:bg-white/30 hover:border-white/50 hover:scale-105"
              >
                Войти
              </Link>
              <Link
                to="/register"
                className="py-2 px-5 bg-white text-indigo-700 font-bold border-2 border-white rounded-lg no-underline transition-all duration-300 hover:bg-indigo-100 hover:border-indigo-200 hover:scale-105"
              >
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
