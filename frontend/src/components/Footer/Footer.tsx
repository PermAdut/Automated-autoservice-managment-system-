import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const Footer = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const branding = useSelector((state: RootState) => state.tenant.branding);

  const companyName = branding?.companyName || "АвтоСервис";
  const tagline = branding?.tagline || "Ваши машины — наша забота";
  const phone = branding?.phone;
  const email = branding?.email;
  const address = branding?.address;
  const workingHours = branding?.workingHours;
  const featureOnlineBooking = branding?.features?.onlineBooking ?? true;

  const canAccess = (roles: string[]) => {
    if (!isAuthenticated || !user) return false;
    return roles.includes(user.roleName);
  };

  return (
    <footer className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-500 text-white shadow-[0_-4px_6px_rgba(0,0,0,0.1)] fixed bottom-0 left-0 w-full z-50">
      <div className="max-w-[1200px] mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        {/* Brand */}
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.1)]">
            {companyName}
          </span>
          <span className="text-xs text-indigo-200">{tagline}</span>
        </div>

        {/* Contact info (visible on large screens) */}
        <div className="hidden lg:flex items-center gap-5 text-xs text-indigo-200">
          {workingHours && <span>🕐 {workingHours}</span>}
          {phone && (
            <a href={`tel:${phone}`} className="text-indigo-100 no-underline hover:text-white transition-colors">
              📞 {phone}
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="text-indigo-100 no-underline hover:text-white transition-colors">
              ✉️ {email}
            </a>
          )}
          {address && <span>📍 {address}</span>}
        </div>

        {/* Navigation */}
        <nav className="flex flex-wrap gap-4 text-xs">
          <Link to="/dashboard" className="font-medium text-indigo-200 no-underline hover:text-white transition-colors">
            Каталог
          </Link>
          {isAuthenticated && (
            <>
              {featureOnlineBooking && (
                <Link to="/booking" className="font-medium text-indigo-200 no-underline hover:text-white transition-colors">
                  Запись
                </Link>
              )}
              <Link to="/orders" className="font-medium text-indigo-200 no-underline hover:text-white transition-colors">
                Заказы
              </Link>
              {canAccess(["admin", "manager"]) && (
                <>
                  <Link to="/analytics" className="font-medium text-indigo-200 no-underline hover:text-white transition-colors">
                    Аналитика
                  </Link>
                  <Link to="/reports" className="font-medium text-indigo-200 no-underline hover:text-white transition-colors">
                    Отчёты
                  </Link>
                </>
              )}
            </>
          )}
          <Link to="/about" className="font-medium text-indigo-200 no-underline hover:text-white transition-colors">
            О нас
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-xs text-indigo-300 whitespace-nowrap m-0">
          © {new Date().getFullYear()} {companyName}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
