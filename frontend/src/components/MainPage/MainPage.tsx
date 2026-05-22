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
  ApartmentOutlined,
  SolutionOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  LockOutlined,
  ClusterOutlined,
  DashboardOutlined,
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
    desc: "Управление записями клиентов и временными слотами",
    route: "/booking",
    feature: "onlineBooking",
    color: "text-indigo-600 bg-indigo-50",
  },
  {
    icon: <FileTextOutlined />,
    title: "Заказы",
    desc: "Список и статусы заказов на обслуживание",
    route: "/orders",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: <TeamOutlined />,
    title: "Сотрудники",
    desc: "Управление персоналом и расписанием работ",
    route: "/employees",
    color: "text-violet-600 bg-violet-50",
  },
  {
    icon: <InboxOutlined />,
    title: "Склад",
    desc: "Запасы, запчасти, остатки по складам",
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
    desc: "Каталог поставщиков и управление закупками",
    route: "/suppliers",
    roles: ["admin", "manager"],
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: <BarChartOutlined />,
    title: "Аналитика",
    desc: "KPI, выручка, топ-услуги и предупреждения",
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

const SYSTEM_MODULES = [
  {
    icon: <FileTextOutlined />,
    title: "Управление заказами",
    desc: "Полный цикл от приёмки до выдачи: статусы, назначение мастеров, контроль сроков.",
    color: "text-blue-600 bg-blue-50 border-blue-100",
  },
  {
    icon: <InboxOutlined />,
    title: "Складской учёт",
    desc: "Остатки запчастей, перемещения между складами, закупки у поставщиков, инвентаризация.",
    color: "text-orange-600 bg-orange-50 border-orange-100",
  },
  {
    icon: <TeamOutlined />,
    title: "Кадровый модуль",
    desc: "Сотрудники, должности, расписание, нагрузка, KPI по мастерам.",
    color: "text-violet-600 bg-violet-50 border-violet-100",
  },
  {
    icon: <BarChartOutlined />,
    title: "Аналитика и отчёты",
    desc: "Дашборды с KPI, динамика выручки, ТОП-услуги, предупреждения по остаткам.",
    color: "text-green-600 bg-green-50 border-green-100",
  },
  {
    icon: <SolutionOutlined />,
    title: "Корпоративные клиенты",
    desc: "Договоры с компаниями, управление парком, корпоративные скидки и кредитные лимиты.",
    color: "text-teal-600 bg-teal-50 border-teal-100",
  },
  {
    icon: <ApartmentOutlined />,
    title: "Мультифилиальность",
    desc: "Единая система для нескольких точек: филиалы, распределение ресурсов, общая отчётность.",
    color: "text-indigo-600 bg-indigo-50 border-indigo-100",
  },
];

const SYSTEM_HIGHLIGHTS = [
  "Управление заказами и статусами в реальном времени",
  "Интегрированный складской и закупочный учёт",
  "Аналитика и KPI-дашборды для руководства",
  "Корпоративные клиенты и договорное обслуживание",
  "Расписание, смены и нагрузка по сотрудникам",
  "Мультифилиальная структура с общей базой данных",
  "Программа лояльности, гарантии, онлайн-запись",
  "Ролевая модель доступа: администратор, менеджер, клиент",
];

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const branding = useSelector((state: RootState) => state.tenant.branding);

  const companyName =
    branding?.companyName || (import.meta.env.VITE_APP_NAME as string) || "АвтоСервис";
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

  // ── Login/Landing (unauthenticated) ──────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col w-full flex-1 min-h-0 bg-gray-50">

        {/* Hero split */}
        <section className="w-full shrink-0 bg-white border-b border-gray-200">
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-14 sm:py-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — system intro */}
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-sm font-medium text-indigo-700 w-fit">
                <DashboardOutlined />
                Система управления автосервисом
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {companyName}
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
                Комплексная платформа для автоматизации процессов автосервисного центра — от приёмки автомобилей до финансовой отчётности.
              </p>

              <ul className="flex flex-col gap-2.5">
                {SYSTEM_HIGHLIGHTS.slice(0, 5).map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircleOutlined className="text-indigo-500 mt-0.5 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="flex gap-3 flex-wrap pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  <LockOutlined />
                  Войти в систему
                  <ArrowRightOutlined />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/register")}
                  className="border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Создать аккаунт
                </Button>
              </div>
            </div>

            {/* Right — system stats/info card */}
            <div className="flex flex-col gap-4">
              <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-2 mb-4 text-gray-400 text-xs font-medium uppercase tracking-widest">
                  <ClusterOutlined />
                  Модули системы
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <FileTextOutlined />, label: "Заказы", color: "text-blue-400" },
                    { icon: <InboxOutlined />, label: "Склад", color: "text-orange-400" },
                    { icon: <TeamOutlined />, label: "Персонал", color: "text-violet-400" },
                    { icon: <BarChartOutlined />, label: "Аналитика", color: "text-green-400" },
                    { icon: <UserOutlined />, label: "Клиенты", color: "text-teal-400" },
                    { icon: <TruckOutlined />, label: "Поставщики", color: "text-amber-400" },
                    { icon: <ApartmentOutlined />, label: "Филиалы", color: "text-indigo-400" },
                    { icon: <FundOutlined />, label: "Отчёты", color: "text-rose-400" },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2.5">
                      <span className={`text-base ${m.color}`}>{m.icon}</span>
                      <span className="text-sm font-medium text-gray-200">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "8", label: "модулей" },
                  { value: "3", label: "роли доступа" },
                  { value: "REST", label: "API" },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                    <div className="text-2xl font-extrabold text-indigo-600">{s.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Modules grid */}
        <section className="w-full flex-1 bg-gray-50 py-12 sm:py-16">
          <div className="w-full max-w-screen-xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Функциональные модули</h2>
              <p className="text-gray-500 mt-1 text-sm">Полный набор инструментов для управления автосервисным бизнесом</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {SYSTEM_MODULES.map((mod) => (
                <div
                  key={mod.title}
                  className={`flex flex-col gap-3 p-5 bg-white rounded-xl border ${mod.color.split(" ")[2]} shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-lg ${mod.color.split(" ")[0]} ${mod.color.split(" ")[1]}`}>
                    {mod.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">{mod.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{mod.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Management Dashboard (authenticated) ─────────────────────────────────
  const isStaff = user?.roleName === "admin" || user?.roleName === "manager";

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 min-h-0 flex flex-col gap-6">

      {/* Welcome strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-gray-200">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-0.5">
            {companyName}
          </p>
          <h1 className="text-2xl font-bold text-gray-800">
            {user?.name} {user?.surName}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">{user?.roleName}</p>
        </div>
        {isStaff && (
          <Button
            onClick={() => navigate("/analytics")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
          >
            <DashboardOutlined />
            Открыть аналитику
          </Button>
        )}
      </div>

      {/* Quick access grid */}
      <div className="flex-1 min-h-0">
        <p className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-widest">
          Быстрый доступ
        </p>
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
