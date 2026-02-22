export const About = () => {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 min-h-[calc(100vh-200px)] md:px-4 md:py-6">
      <div className="bg-white rounded-xl shadow-md px-12 py-12 md:px-6 md:py-8">
        <h1 className="text-5xl font-extrabold text-indigo-700 mb-8 text-center md:text-4xl">
          О нас
        </h1>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4 border-b-4 border-indigo-700 pb-2 md:text-2xl">
            Добро пожаловать в АвтоСервис
          </h2>
          <p className="text-lg leading-7 text-slate-600 mb-4 md:text-base">
            Мы — современная система управления автосервисом, которая помогает
            эффективно организовывать работу автосервиса, управлять заказами,
            клиентами и сотрудниками.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4 border-b-4 border-indigo-700 pb-2 md:text-2xl">
            Наши возможности
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mt-6 md:grid-cols-1">
            <div className="bg-slate-50 rounded-lg p-6 border-l-4 border-indigo-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(67,56,202,0.1)]">
              <h3 className="text-xl font-semibold text-indigo-700 mb-3">Управление заказами</h3>
              <p className="text-lg leading-7 text-slate-600 md:text-base">
                Создавайте и отслеживайте заказы на ремонт автомобилей.
                Управляйте статусами заказов и контролируйте процесс выполнения работ.
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-6 border-l-4 border-indigo-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(67,56,202,0.1)]">
              <h3 className="text-xl font-semibold text-indigo-700 mb-3">Каталог запчастей</h3>
              <p className="text-lg leading-7 text-slate-600 md:text-base">
                Полный каталог запчастей и услуг с актуальными ценами.
                Удобный поиск и фильтрация по категориям.
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-6 border-l-4 border-indigo-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(67,56,202,0.1)]">
              <h3 className="text-xl font-semibold text-indigo-700 mb-3">Управление клиентами</h3>
              <p className="text-lg leading-7 text-slate-600 md:text-base">
                Ведите базу клиентов, отслеживайте историю обслуживания
                и управляйте автомобилями ваших клиентов.
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-6 border-l-4 border-indigo-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(67,56,202,0.1)]">
              <h3 className="text-xl font-semibold text-indigo-700 mb-3">Отчёты и аналитика</h3>
              <p className="text-lg leading-7 text-slate-600 md:text-base">
                Генерируйте подробные отчёты о работе автосервиса,
                анализируйте статистику и планируйте развитие бизнеса.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4 border-b-4 border-indigo-700 pb-2 md:text-2xl">
            Почему выбирают нас
          </h2>
          <ul className="list-none p-0 m-0">
            <li className="text-lg leading-7 text-slate-600 py-3 pl-8 relative before:content-['✓'] before:absolute before:left-0 before:text-indigo-700 before:font-bold before:text-2xl md:text-base">
              <strong className="text-slate-800 font-semibold">Удобство использования</strong> — интуитивно понятный интерфейс
            </li>
            <li className="text-lg leading-7 text-slate-600 py-3 pl-8 relative before:content-['✓'] before:absolute before:left-0 before:text-indigo-700 before:font-bold before:text-2xl md:text-base">
              <strong className="text-slate-800 font-semibold">Надёжность</strong> — стабильная работа системы 24/7
            </li>
            <li className="text-lg leading-7 text-slate-600 py-3 pl-8 relative before:content-['✓'] before:absolute before:left-0 before:text-indigo-700 before:font-bold before:text-2xl md:text-base">
              <strong className="text-slate-800 font-semibold">Безопасность</strong> — защита данных клиентов и компании
            </li>
            <li className="text-lg leading-7 text-slate-600 py-3 pl-8 relative before:content-['✓'] before:absolute before:left-0 before:text-indigo-700 before:font-bold before:text-2xl md:text-base">
              <strong className="text-slate-800 font-semibold">Поддержка</strong> — мы всегда готовы помочь вам
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-slate-800 mb-4 border-b-4 border-indigo-700 pb-2 md:text-2xl">
            Свяжитесь с нами
          </h2>
          <p className="text-lg leading-7 text-slate-600 mb-4 md:text-base">
            Если у вас есть вопросы или предложения, мы будем рады услышать от вас.
            Используйте систему для связи с нашей командой поддержки.
          </p>
        </section>
      </div>
    </div>
  );
};
