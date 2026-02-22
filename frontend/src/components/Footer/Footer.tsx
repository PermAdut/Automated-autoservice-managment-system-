import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const Footer = () => {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const canAccess = (roles: string[]) => {
    if (!isAuthenticated || !user) return false;
    return roles.includes(user.roleName);
  };

  return (
    <footer className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-500 text-white shadow-[0_-4px_6px_rgba(0,0,0,0.1)] fixed bottom-0 left-0 w-full z-50">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-6 md:flex-col md:text-center">
        <div className="footer-logo">
          <h2 className="text-2xl font-bold mb-2 m-0 [text-shadow:0_2px_4px_rgba(0,0,0,0.1)]">
            АвтоСервис
          </h2>
          <p className="text-sm text-indigo-200 m-0">Ваши машины — наша забота</p>
        </div>

        <nav className="flex gap-6 flex-wrap md:justify-center">
          <Link
            to="/dashboard"
            className="text-base font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
          >
            Каталог
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/orders"
                className="text-base font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
              >
                Заказы
              </Link>
              <Link
                to="/employees"
                className="text-base font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
              >
                Рабочие
              </Link>
              {canAccess(["admin", "manager"]) && (
                <>
                  <Link
                    to="/clients"
                    className="text-base font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
                  >
                    Клиенты
                  </Link>
                  <Link
                    to="/suppliers"
                    className="text-base font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
                  >
                    Поставки
                  </Link>
                  <Link
                    to="/reports"
                    className="text-base font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
                  >
                    Отчёты
                  </Link>
                </>
              )}
            </>
          )}
          <Link
            to="/about"
            className="text-base font-medium text-indigo-200 no-underline transition-all duration-300 hover:text-white hover:scale-105 hover:underline hover:underline-offset-4"
          >
            О нас
          </Link>
        </nav>

        <div>
          <p className="text-sm text-indigo-200 m-0 text-center">
            &copy; {new Date().getFullYear()} АвтоСервис. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
