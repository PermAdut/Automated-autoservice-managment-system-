import {
  FileTextOutlined,
  InboxOutlined,
  TeamOutlined,
  FundOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  CustomerServiceOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const features = [
  {
    icon: <FileTextOutlined />,
    title: "Управление заказами",
    desc: "Создавайте и отслеживайте заказы на ремонт автомобилей. Управляйте статусами и контролируйте процесс выполнения работ.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: <InboxOutlined />,
    title: "Каталог запчастей",
    desc: "Полный каталог запчастей и услуг с актуальными ценами. Удобный поиск и фильтрация по категориям.",
    color: "bg-orange-50 text-orange-500",
  },
  {
    icon: <TeamOutlined />,
    title: "Управление клиентами",
    desc: "Ведите базу клиентов, отслеживайте историю обслуживания и управляйте автомобилями ваших клиентов.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: <FundOutlined />,
    title: "Отчёты и аналитика",
    desc: "Генерируйте подробные отчёты о работе автосервиса, анализируйте статистику и планируйте развитие бизнеса.",
    color: "bg-green-50 text-green-600",
  },
];

const advantages = [
  {
    icon: <ThunderboltOutlined />,
    title: "Удобство использования",
    desc: "Интуитивно понятный интерфейс без лишней сложности",
    color: "bg-amber-50 text-amber-500",
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: "Надёжность",
    desc: "Стабильная работа системы 24/7",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: <LockOutlined />,
    title: "Безопасность",
    desc: "Защита данных клиентов и компании",
    color: "bg-red-50 text-red-500",
  },
  {
    icon: <CustomerServiceOutlined />,
    title: "Поддержка",
    desc: "Всегда готовы помочь вам",
    color: "bg-indigo-50 text-indigo-600",
  },
];

export const About = () => {
  return (
    <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 pb-24">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <CalendarOutlined />
          Система управления автосервисом
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
          О нас
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
          Мы — современная система управления автосервисом, которая помогает
          эффективно организовывать работу, управлять заказами, клиентами и сотрудниками.
        </p>
      </div>

      {/* Features */}
      <section className="mb-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Наши возможности</h2>
        <p className="text-gray-500 mb-8 text-base sm:text-lg">Всё необходимое для современного автосервиса</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Advantages */}
      <section className="mb-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Почему выбирают нас</h2>
        <p className="text-gray-500 mb-8 text-base sm:text-lg">Наши преимущества перед другими системами</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((a) => (
            <div key={a.title} className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mx-auto mb-3 ${a.color}`}>
                {a.icon}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{a.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section>
        <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl p-8 sm:p-10 lg:p-12 text-white text-center">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
            <CustomerServiceOutlined />
          </div>
          <h2 className="text-2xl font-bold mb-2">Свяжитесь с нами</h2>
          <p className="text-indigo-100 max-w-xl mx-auto text-base sm:text-lg">
            Если у вас есть вопросы или предложения, мы будем рады услышать от вас.
            Используйте систему для связи с нашей командой поддержки.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-indigo-200">
            <CheckCircleOutlined />
            Ответим в течение рабочего дня
          </div>
        </div>
      </section>
    </div>
  );
};
