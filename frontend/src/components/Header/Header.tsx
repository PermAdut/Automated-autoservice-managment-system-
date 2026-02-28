import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  AppstoreOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  TruckOutlined,
  FundOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { RootState } from "../../store";
import { logout } from "../../store/slices/authSlice";
import { useLogoutMutation } from "../../api/baseApi";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
  feature?: keyof NonNullable<NonNullable<RootState["tenant"]["branding"]>["features"]>;
}

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [logoutMutation] = useLogoutMutation();
  const companyName = useSelector(
    (state: RootState) => state.tenant.branding?.companyName ?? "АвтоСервис"
  );
  const featureOnlineBooking = useSelector(
    (state: RootState) => state.tenant.branding?.features?.onlineBooking ?? true
  );

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

  const canAccess = (roles?: string[]) => {
    if (!roles) return true;
    if (!isAuthenticated || !user) return false;
    return roles.includes(user.roleName);
  };

  const navItems: NavItem[] = [
    { to: "/dashboard", label: "Каталог", icon: <AppstoreOutlined /> },
    ...(isAuthenticated
      ? [
          ...(featureOnlineBooking
            ? [{ to: "/booking", label: "Запись", icon: <CalendarOutlined /> }]
            : []),
          { to: "/orders", label: "Заказы", icon: <FileTextOutlined /> },
          { to: "/employees", label: "Мастера", icon: <TeamOutlined /> },
          {
            to: "/clients",
            label: "Клиенты",
            icon: <UserOutlined />,
            roles: ["admin", "manager"],
          },
          {
            to: "/suppliers",
            label: "Поставки",
            icon: <TruckOutlined />,
            roles: ["admin", "manager"],
          },
          {
            to: "/reports",
            label: "Отчёты",
            icon: <FundOutlined />,
            roles: ["admin", "manager"],
          },
          {
            to: "/analytics",
            label: "Аналитика",
            icon: <BarChartOutlined />,
            roles: ["admin", "manager"],
          },
          {
            to: "/settings",
            label: "Настройки",
            icon: <SettingOutlined />,
            roles: ["admin"],
          },
        ]
      : []),
    { to: "/about", label: "О нас", icon: <InfoCircleOutlined /> },
  ].filter((item) => canAccess(item.roles));

  const linkClass = cn(
    "flex items-center gap-1.5 text-sm font-medium text-indigo-200 no-underline transition-all duration-200",
    "hover:text-white hover:scale-[1.03]"
  );

  return (
    <header className="w-full min-w-full bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-500 shadow-md sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="text-white font-extrabold text-2xl tracking-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.15)] hover:opacity-90 transition-opacity shrink-0 cursor-pointer bg-transparent border-none p-0"
        >
          {companyName}
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex flex-wrap items-center gap-5 lg:gap-7">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className={linkClass}>
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isAuthenticated && user ? (
            <>
              <Link
                to="/profile"
                className="flex flex-col items-end no-underline hover:opacity-80 transition-opacity"
              >
                <span className="text-sm font-semibold text-white leading-tight">
                  {user.name} {user.surName}
                </span>
                <span className="text-xs text-indigo-200 capitalize">{user.roleName}</span>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5"
              >
                <LogoutOutlined />
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="py-2 px-4 bg-white/20 text-white text-sm font-semibold border border-white/30 rounded-lg no-underline transition-all hover:bg-white/30"
              >
                Войти
              </Link>
              <Link
                to="/register"
                className="py-2 px-4 bg-white text-indigo-700 text-sm font-bold border border-white rounded-lg no-underline transition-all hover:bg-indigo-50"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Меню"
        >
          {mobileOpen ? <CloseOutlined className="text-xl" /> : <MenuOutlined className="text-xl" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/20 bg-indigo-700/95 backdrop-blur-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-2 w-full">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-indigo-100 no-underline hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <div className="border-t border-white/20 mt-2 pt-2">
              {isAuthenticated && user ? (
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-all text-sm font-medium border-none bg-transparent cursor-pointer"
                >
                  <LogoutOutlined />
                  Выйти ({user.name})
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    className="flex-1 py-2 text-center bg-white/20 text-white text-sm font-semibold rounded-lg no-underline hover:bg-white/30"
                    onClick={() => setMobileOpen(false)}
                  >
                    Войти
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 py-2 text-center bg-white text-indigo-700 text-sm font-bold rounded-lg no-underline hover:bg-indigo-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
