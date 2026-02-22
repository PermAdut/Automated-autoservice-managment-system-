import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

interface QuickCard {
  icon: string;
  title: string;
  desc: string;
  route: string;
  roles?: string[];
  feature?: string;
}

const QUICK_CARDS: QuickCard[] = [
  {
    icon: "📅",
    title: "Онлайн-запись",
    desc: "Выберите удобное время и запишитесь на обслуживание",
    route: "/booking",
    feature: "onlineBooking",
  },
  {
    icon: "📋",
    title: "Мои заказы",
    desc: "Отслеживайте статус текущих и прошлых заказов",
    route: "/orders",
  },
  {
    icon: "👷",
    title: "Мастера",
    desc: "Познакомьтесь с нашей командой специалистов",
    route: "/employees",
  },
  {
    icon: "📦",
    title: "Склад и запчасти",
    desc: "Управление запасами и ценами на комплектующие",
    route: "/dashboard",
    roles: ["admin", "manager"],
  },
  {
    icon: "👥",
    title: "Клиенты",
    desc: "База клиентов и история обслуживания",
    route: "/clients",
    roles: ["admin", "manager"],
  },
  {
    icon: "🚚",
    title: "Поставщики",
    desc: "Каталог поставщиков запчастей и расходников",
    route: "/suppliers",
    roles: ["admin", "manager"],
  },
  {
    icon: "📊",
    title: "Аналитика",
    desc: "KPI, выручка, топ-услуги и предупреждения склада",
    route: "/analytics",
    roles: ["admin", "manager"],
  },
  {
    icon: "📄",
    title: "Отчёты",
    desc: "Генерация отчётов по заказам, складу, финансам",
    route: "/reports",
    roles: ["admin", "manager"],
  },
];

const FEATURES_DISPLAY = [
  { key: "onlineBooking", icon: "🗓️", label: "Онлайн-запись" },
  { key: "loyaltyProgram", icon: "⭐", label: "Программа лояльности" },
  { key: "vinDecoder", icon: "🔍", label: "VIN-декодер" },
  { key: "smsNotifications", icon: "📱", label: "SMS-уведомления" },
  { key: "emailNotifications", icon: "✉️", label: "Email-уведомления" },
  { key: "partnerNetwork", icon: "🤝", label: "Партнёрская сеть" },
  { key: "multiBranch", icon: "🏢", label: "Мультифилиальность" },
  { key: "corporateClients", icon: "💼", label: "Корп. клиенты" },
];

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const branding = useSelector((state: RootState) => state.tenant.branding);

  const companyName = branding?.companyName || (import.meta.env.VITE_APP_NAME as string) || "АвтоСервис";
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
    (c) => canAccess(c.roles) && isFeatureEnabled(c.feature),
  );

  // ── Landing (unauthenticated) ────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-160px)] -mt-8 -mx-4">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-500 text-white">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative max-w-[1200px] mx-auto px-6 py-20 flex flex-col items-center text-center gap-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              Мы работаем для вас
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight" style={{ textShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
              {companyName}
            </h1>
            <p className="text-xl text-indigo-100 max-w-xl">{tagline}</p>

            {/* Contact chips */}
            {(phone || workingHours || address) && (
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium no-underline text-white transition-all"
                  >
                    📞 {phone}
                  </a>
                )}
                {workingHours && (
                  <span className="flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm">
                    🕐 {workingHours}
                  </span>
                )}
                {address && (
                  <span className="flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm">
                    📍 {address}
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-4 mt-4 flex-wrap justify-center">
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-3 bg-white text-indigo-700 font-bold rounded-xl shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all"
              >
                Войти в систему
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-3 bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold rounded-xl transition-all hover:scale-105"
              >
                Регистрация
              </button>
            </div>
          </div>
        </section>

        {/* Active features */}
        {features && (
          <section className="bg-gray-50 py-16">
            <div className="max-w-[1200px] mx-auto px-6">
              <h2 className="text-center text-2xl font-bold text-gray-700 mb-8">
                Возможности системы
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {FEATURES_DISPLAY.filter(
                  (f) => (features as Record<string, boolean>)[f.key],
                ).map((f) => (
                  <div
                    key={f.key}
                    className="flex flex-col items-center gap-2 p-5 bg-white rounded-xl border border-gray-200 shadow-sm text-center hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    <span className="text-3xl">{f.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why us */}
        <section className="bg-white py-16 border-t border-gray-100">
          <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: "🔧", title: "Опытные мастера", desc: "Специалисты с многолетним опытом и сертификатами" },
              { icon: "⚡", title: "Быстрое обслуживание", desc: "Онлайн-запись, чёткие сроки, SMS-уведомления" },
              { icon: "🛡️", title: "Гарантия качества", desc: "Официальная гарантия на все виды работ" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-3">
                <span className="text-5xl">{item.icon}</span>
                <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ── Dashboard (authenticated) ────────────────────────────────────────────
  return (
    <div className="max-w-[1200px] mx-auto px-2 py-6 min-h-[calc(100vh-160px)]">
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
          <div className="flex flex-col sm:items-end gap-2 text-sm text-indigo-100">
            {workingHours && <span>🕐 {workingHours}</span>}
            {phone && (
              <a href={`tel:${phone}`} className="text-white font-semibold no-underline hover:underline">
                📞 {phone}
              </a>
            )}
            {address && <span className="text-indigo-200">📍 {address}</span>}
          </div>
        </div>
      </div>

      {/* Quick access grid */}
      <div>
        <h2 className="text-base font-semibold text-gray-500 mb-4 uppercase tracking-wide">
          Быстрый доступ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleCards.map((card) => (
            <button
              key={card.route}
              onClick={() => navigate(card.route)}
              className="group text-left p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-400 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <span className="text-3xl mb-3 block">{card.icon}</span>
              <h3 className="text-base font-semibold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-gray-400 leading-snug">{card.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
