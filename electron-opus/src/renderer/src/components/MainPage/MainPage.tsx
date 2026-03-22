import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  InboxOutlined,
  UserOutlined,
  TruckOutlined,
  BarChartOutlined,
  FundOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  WifiOutlined,
  StarOutlined,
  ScanOutlined,
  MobileOutlined,
  MailOutlined,
  TeamOutlined as HandshakeOutlined,
  ApartmentOutlined,
  SolutionOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { RootState } from "../../store";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface QuickCard {
  icon: React.ReactNode;
  title: string;
  desc: string;
  route: string;
  roles?: string[];
  feature?: string;
  color: string;
}

const QUICK_CARDS: QuickCard[] = [
  {
    icon: <CalendarOutlined />,
    title: "Онлайн-запись",
    desc: "Выберите удобное время и запишитесь на обслуживание",
    route: "/booking",
    feature: "onlineBooking",
    color: "text-indigo-600 bg-indigo-50",
  },
  {
    icon: <FileTextOutlined />,
    title: "Мои заказы",
    desc: "Отслеживайте статус текущих и прошлых заказов",
    route: "/orders",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: <TeamOutlined />,
    title: "Мастера",
    desc: "Познакомьтесь с нашей командой специалистов",
    route: "/employees",
    color: "text-violet-600 bg-violet-50",
  },
  {
    icon: <InboxOutlined />,
    title: "Склад и запчасти",
    desc: "Управление запасами и ценами на комплектующие",
    route: "/dashboard",
    roles: ["admin", "manager"],
    color: "text-orange-600 bg-orange-50",
  },
  {
    icon: <UserOutlined />,
    title: "Клиенты",
    desc: "База клиентов и история обслуживания",
    route: "/clients",
    roles: ["admin", "manager"],
    color: "text-teal-600 bg-teal-50",
  },
  {
    icon: <TruckOutlined />,
    title: "Поставщики",
    desc: "Каталог поставщиков запчастей и расходников",
    route: "/suppliers",
    roles: ["admin", "manager"],
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: <BarChartOutlined />,
    title: "Аналитика",
    desc: "KPI, выручка, топ-услуги и предупреждения склада",
    route: "/analytics",
    roles: ["admin", "manager"],
    color: "text-green-600 bg-green-50",
  },
  {
    icon: <FundOutlined />,
    title: "Отчёты",
    desc: "Генерация отчётов по заказам, складу, финансам",
    route: "/reports",
    roles: ["admin", "manager"],
    color: "text-rose-600 bg-rose-50",
  },
];

const FEATURES_DISPLAY = [
  { key: "onlineBooking", icon: <CalendarOutlined />, label: "Онлайн-запись" },
  { key: "loyaltyProgram", icon: <StarOutlined />, label: "Программа лояльности" },
  { key: "vinDecoder", icon: <ScanOutlined />, label: "VIN-декодер" },
  { key: "smsNotifications", icon: <MobileOutlined />, label: "SMS-уведомления" },
  { key: "emailNotifications", icon: <MailOutlined />, label: "Email-уведомления" },
  { key: "partnerNetwork", icon: <HandshakeOutlined />, label: "Партнёрская сеть" },
  { key: "multiBranch", icon: <ApartmentOutlined />, label: "Мультифилиальность" },
  { key: "corporateClients", icon: <SolutionOutlined />, label: "Корп. клиенты" },
];

const WHY_US = [
  {
    icon: <ToolOutlined style={{ fontSize: 36 }} />,
    title: "Опытные мастера",
    desc: "Специалисты с многолетним опытом и сертификатами",
    color: "text-indigo-600",
  },
  {
    icon: <ThunderboltOutlined style={{ fontSize: 36 }} />,
    title: "Быстрое обслуживание",
    desc: "Онлайн-запись, чёткие сроки, SMS-уведомления о статусе",
    color: "text-amber-500",
  },
  {
    icon: <SafetyCertificateOutlined style={{ fontSize: 36 }} />,
    title: "Гарантия качества",
    desc: "Официальная гарантия на все виды работ и запчасти",
    color: "text-green-600",
  },
  {
    icon: <WifiOutlined style={{ fontSize: 36 }} />,
    title: "Онлайн-мониторинг",
    desc: "Следите за статусом ремонта в реальном времени",
    color: "text-blue-600",
  },
];

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const branding = useSelector((state: RootState) => state.tenant.branding);

  const companyName =
    branding?.companyName || (import.meta.env.VITE_APP_NAME as string) || "АвтоСервис";
  const tagline = branding?.tagline || "Профессиональный уход за вашим автомобилем";
  const phone = branding?.phone;
  const workingHours = branding?.workingHours;
  const address = branding?.address;
  const features = branding?.features;

  const canAccess = (roles?: string[]) => {
    if (!roles) return true;
    if (!isAuthenticated || !user) return false;
    return roles.includes(user.roleName);
  };

  const isFeatureEnabled = (featureKey?: string) => {
    if (!featureKey || !features) return true;
    return (features as Record<string, boolean>)[featureKey] !== false;
  };

  const visibleCards = QUICK_CARDS.filter(
    (c) => canAccess(c.roles) && isFeatureEnabled(c.feature)
  );

  // ── Landing (unauthenticated) ────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col w-full flex-1 min-h-0">
        {/* Hero */}
        <section className="relative overflow-hidden w-full flex-shrink-0 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-500 text-white">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative w-full max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12 py-14 sm:py-20 lg:py-24 flex flex-col items-center text-center gap-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              Мы работаем для вас
            </div>

            <h1
              className="text-5xl sm:text-6xl font-extrabold tracking-tight"
              style={{ textShadow: "0 4px 24px rgba(0,0,0,0.2)" }}
            >
              {companyName}
            </h1>
            <p className="text-xl sm:text-2xl text-indigo-100 max-w-2xl leading-relaxed">{tagline}</p>

            {/* Contact chips */}
            {(phone || workingHours || address) && (
              <div className="flex flex-wrap justify-center gap-3 mt-1">
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium no-underline text-white transition-all"
                  >
                    <PhoneOutlined />
                    {phone}
                  </a>
                )}
                {workingHours && (
                  <span className="flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm">
                    <ClockCircleOutlined />
                    {workingHours}
                  </span>
                )}
                {address && (
                  <span className="flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm">
                    <EnvironmentOutlined />
                    {address}
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-4 mt-2 flex-wrap justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold shadow-lg"
              >
                Войти в систему
                <ArrowRightOutlined />
              </Button>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-2.5 bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold rounded-xl transition-all hover:scale-105 text-base cursor-pointer"
              >
                Регистрация
              </button>
            </div>
          </div>
        </section>

        {/* Active features */}
        {features && (
          <section className="w-full flex-shrink-0 bg-gray-50 py-10 sm:py-12">
            <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12">
              <h2 className="text-center text-2xl font-bold text-gray-700 mb-6">
                Возможности системы
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {FEATURES_DISPLAY.filter(
                  (f) => (features as Record<string, boolean>)[f.key]
                ).map((f) => (
                  <div
                    key={f.key}
                    className="flex flex-col items-center gap-2.5 p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    <span className="text-2xl text-indigo-600">{f.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why us — flex-1 fills remaining viewport */}
        <section className="w-full flex-1 min-h-[min(40vh,400px)] bg-white py-12 sm:py-16 lg:py-20 border-t border-gray-100">
          <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12">
            <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-700 mb-8 sm:mb-10">
              Почему выбирают нас
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 text-center items-stretch">
              {WHY_US.map((item) => (
                <div key={item.title} className="flex flex-col items-center justify-center gap-4 p-6 sm:p-8 bg-gray-50/50 rounded-2xl min-h-[200px]">
                  <div className={item.color}>{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Dashboard (authenticated) ────────────────────────────────────────────
  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 min-h-0 flex flex-col">
      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-2xl p-8 mb-8 shadow-md">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">Добро пожаловать</p>
            <h1 className="text-3xl font-extrabold">
              {user?.name} {user?.surName}
            </h1>
            <p className="text-indigo-200 mt-1 capitalize text-sm">
              {user?.roleName} · {companyName}
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-1.5 text-sm text-indigo-100">
            {workingHours && (
              <span className="flex items-center gap-1.5">
                <ClockCircleOutlined />
                {workingHours}
              </span>
            )}
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-1.5 text-white font-semibold no-underline hover:underline"
              >
                <PhoneOutlined />
                {phone}
              </a>
            )}
            {address && (
              <span className="flex items-center gap-1.5 text-indigo-200">
                <EnvironmentOutlined />
                {address}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick access grid */}
      <div className="flex-1 min-h-0">
        <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-widest">
          Быстрый доступ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleCards.map((card) => (
            <Card
              key={card.route}
              className="group cursor-pointer hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col min-w-0"
              onClick={() => navigate(card.route)}
            >
              <div className="p-5 flex flex-col flex-1">
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-lg mb-3 ${card.color}`}
                >
                  {card.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-400 leading-snug">{card.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
