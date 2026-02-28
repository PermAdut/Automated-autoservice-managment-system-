import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  FileTextOutlined,
  BarChartOutlined,
  FundOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
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
    <footer className="w-full min-w-full bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-500 text-white shadow-[0_-4px_6px_rgba(0,0,0,0.1)] shrink-0 mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        {/* Brand */}
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.15)]">
            {companyName}
          </span>
          <span className="text-xs text-indigo-200">{tagline}</span>
        </div>

        {/* Contacts (lg only) */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-indigo-200">
          {workingHours && (
            <span className="flex items-center gap-1">
              <ClockCircleOutlined />
              {workingHours}
            </span>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-1 text-indigo-100 no-underline hover:text-white transition-colors"
            >
              <PhoneOutlined />
              {phone}
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-1 text-indigo-100 no-underline hover:text-white transition-colors"
            >
              <MailOutlined />
              {email}
            </a>
          )}
          {address && (
            <span className="flex items-center gap-1">
              <EnvironmentOutlined />
              {address}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="hidden sm:flex flex-wrap gap-3 text-xs">
          <Link
            to="/dashboard"
            className="flex items-center gap-1 font-medium text-indigo-200 no-underline hover:text-white transition-colors"
          >
            <AppstoreOutlined />
            Каталог
          </Link>
          {isAuthenticated && (
            <>
              {featureOnlineBooking && (
                <Link
                  to="/booking"
                  className="flex items-center gap-1 font-medium text-indigo-200 no-underline hover:text-white transition-colors"
                >
                  <CalendarOutlined />
                  Запись
                </Link>
              )}
              <Link
                to="/orders"
                className="flex items-center gap-1 font-medium text-indigo-200 no-underline hover:text-white transition-colors"
              >
                <FileTextOutlined />
                Заказы
              </Link>
              {canAccess(["admin", "manager"]) && (
                <>
                  <Link
                    to="/analytics"
                    className="flex items-center gap-1 font-medium text-indigo-200 no-underline hover:text-white transition-colors"
                  >
                    <BarChartOutlined />
                    Аналитика
                  </Link>
                  <Link
                    to="/reports"
                    className="flex items-center gap-1 font-medium text-indigo-200 no-underline hover:text-white transition-colors"
                  >
                    <FundOutlined />
                    Отчёты
                  </Link>
                </>
              )}
            </>
          )}
          <Link
            to="/about"
            className="flex items-center gap-1 font-medium text-indigo-200 no-underline hover:text-white transition-colors"
          >
            <InfoCircleOutlined />
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
