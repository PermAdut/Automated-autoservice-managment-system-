import { useState, useRef, useEffect } from "react";
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
  CarOutlined,
  SafetyCertificateOutlined,
  StarOutlined,
  MedicineBoxOutlined,
  ApartmentOutlined,
  SolutionOutlined,
  ScheduleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { RootState } from "../../store";
import { logout } from "../../store/slices/authSlice";
import { useLogoutMutation } from "../../api/baseApi";
import { cn } from "../../lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [logoutMutation] = useLogoutMutation();
  const companyName = useSelector(
    (state: RootState) => state.tenant.branding?.companyName ?? "АвтоСервис"
  );
  const featureOnlineBooking = useSelector(
    (state: RootState) => state.tenant.branding?.features?.onlineBooking ?? true
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setUserDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setUserDropOpen(false);
    setMobileOpen(false);
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await logoutMutation({ refresh_token: refreshToken }).unwrap();
      }
    } catch {
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

  const mainNavItems: NavItem[] = [
    { to: "/catalog", label: "Услуги", icon: <AppstoreOutlined /> },
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
            to: "/dashboard",
            label: "Склад",
            icon: <TruckOutlined />,
            roles: ["admin", "manager"],
          },
          {
            to: "/schedule",
            label: "Расписание",
            icon: <ScheduleOutlined />,
            roles: ["admin", "manager"],
          },
          {
            to: "/analytics",
            label: "Аналитика",
            icon: <BarChartOutlined />,
            roles: ["admin", "manager"],
          },
        ]
      : []),
    { to: "/about", label: "О нас", icon: <InfoCircleOutlined /> },
  ].filter((item) => canAccess(item.roles));

  const userMenuItems: NavItem[] = isAuthenticated
    ? [
        { to: "/profile", label: "Мой профиль", icon: <UserOutlined /> },
        { to: "/vehicles", label: "Мой гараж", icon: <CarOutlined /> },
        { to: "/diagnostics", label: "Диагностика", icon: <MedicineBoxOutlined /> },
        { to: "/warranty", label: "Гарантия", icon: <SafetyCertificateOutlined /> },
        { to: "/loyalty", label: "Лояльность", icon: <StarOutlined /> },
        ...([
          { to: "/branches", label: "Филиалы", icon: <ApartmentOutlined />, roles: ["admin", "manager"] },
          { to: "/corporate", label: "Корп. клиенты", icon: <SolutionOutlined />, roles: ["admin", "manager"] },
          { to: "/suppliers", label: "Поставщики", icon: <TruckOutlined />, roles: ["admin", "manager"] },
          { to: "/reports", label: "Отчёты", icon: <FundOutlined />, roles: ["admin", "manager"] },
          { to: "/settings", label: "Настройки", icon: <SettingOutlined />, roles: ["admin"] },
        ] as NavItem[]).filter((item) => canAccess(item.roles)),
      ]
    : [];

  const linkClass = cn(
    "flex items-center gap-1.5 text-sm font-medium text-indigo-200 no-underline transition-all duration-200",
    "hover:text-white hover:scale-[1.03]"
  );

  return (
    <header className="w-full min-w-full bg-linear-to-r from-indigo-700 via-indigo-600 to-blue-500 shadow-md sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-white font-extrabold text-2xl tracking-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.15)] hover:opacity-90 transition-opacity shrink-0 cursor-pointer bg-transparent border-none p-0"
        >
          {companyName}
        </button>

        <nav className="hidden md:flex flex-wrap items-center gap-4 lg:gap-6">
          {mainNavItems.map((item) => (
            <Link key={item.to} to={item.to} className={linkClass}>
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isAuthenticated && user ? (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setUserDropOpen((v) => !v)}
                className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 hover:opacity-80 transition-opacity"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-white leading-tight">
                    {user.name} {user.surName}
                  </span>
                  <span className="text-xs text-indigo-200 capitalize">{user.roleName}</span>
                </div>
                <DownOutlined
                  className={cn(
                    "text-indigo-200 text-xs transition-transform duration-200",
                    userDropOpen && "rotate-180"
                  )}
                />
              </button>

              {userDropOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1">
                  {userMenuItems.map((item, i) => {
                    const isLast = i === userMenuItems.length - 1;
                    const isFirstAdminItem = item.roles?.includes("admin") && i > 0 && !userMenuItems[i - 1].roles;
                    return (
                      <div key={item.to}>
                        {isFirstAdminItem && <div className="mx-3 my-1 border-t border-gray-100" />}
                        <Link
                          to={item.to}
                          onClick={() => setUserDropOpen(false)}
                          className={cn(
                            "flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 no-underline hover:bg-gray-50 hover:text-indigo-600 transition-colors",
                            isLast && "text-gray-600"
                          )}
                        >
                          <span className="text-gray-400">{item.icon}</span>
                          {item.label}
                        </Link>
                      </div>
                    );
                  })}
                  <div className="mx-3 my-1 border-t border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2.5 w-full text-sm text-red-600 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                  >
                    <LogoutOutlined />
                    Выйти
                  </button>
                </div>
              )}
            </div>
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

        <button
          className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Меню"
        >
          {mobileOpen ? <CloseOutlined className="text-xl" /> : <MenuOutlined className="text-xl" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/20 bg-indigo-700/95 backdrop-blur-sm max-h-[80vh] overflow-y-auto">
          <nav className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-1 w-full">
            {mainNavItems.map((item) => (
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

            {isAuthenticated && userMenuItems.length > 0 && (
              <>
                <div className="border-t border-white/20 my-1" />
                {userMenuItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-indigo-200 no-underline hover:bg-white/10 hover:text-white transition-all text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </>
            )}

            <div className="border-t border-white/20 mt-1 pt-2">
              {isAuthenticated && user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-all text-sm font-medium border-none bg-transparent cursor-pointer"
                >
                  <LogoutOutlined />
                  Выйти ({user.name})
                </button>
              ) : (
                <div className="flex gap-2 px-1">
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
