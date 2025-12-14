import './About.css';

export const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">О нас</h1>
        
        <section className="about-section">
          <h2 className="about-section-title">Добро пожаловать в АвтоСервис</h2>
          <p className="about-text">
            Мы — современная система управления автосервисом, которая помогает 
            эффективно организовывать работу автосервиса, управлять заказами, 
            клиентами и сотрудниками.
          </p>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">Наши возможности</h2>
          <div className="about-features">
            <div className="about-feature">
              <h3 className="about-feature-title">Управление заказами</h3>
              <p className="about-text">
                Создавайте и отслеживайте заказы на ремонт автомобилей. 
                Управляйте статусами заказов и контролируйте процесс выполнения работ.
              </p>
            </div>
            <div className="about-feature">
              <h3 className="about-feature-title">Каталог запчастей</h3>
              <p className="about-text">
                Полный каталог запчастей и услуг с актуальными ценами. 
                Удобный поиск и фильтрация по категориям.
              </p>
            </div>
            <div className="about-feature">
              <h3 className="about-feature-title">Управление клиентами</h3>
              <p className="about-text">
                Ведите базу клиентов, отслеживайте историю обслуживания 
                и управляйте автомобилями ваших клиентов.
              </p>
            </div>
            <div className="about-feature">
              <h3 className="about-feature-title">Отчёты и аналитика</h3>
              <p className="about-text">
                Генерируйте подробные отчёты о работе автосервиса, 
                анализируйте статистику и планируйте развитие бизнеса.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">Почему выбирают нас</h2>
          <ul className="about-list">
            <li className="about-list-item">
              <strong>Удобство использования</strong> — интуитивно понятный интерфейс
            </li>
            <li className="about-list-item">
              <strong>Надёжность</strong> — стабильная работа системы 24/7
            </li>
            <li className="about-list-item">
              <strong>Безопасность</strong> — защита данных клиентов и компании
            </li>
            <li className="about-list-item">
              <strong>Поддержка</strong> — мы всегда готовы помочь вам
            </li>
          </ul>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">Свяжитесь с нами</h2>
          <p className="about-text">
            Если у вас есть вопросы или предложения, мы будем рады услышать от вас. 
            Используйте систему для связи с нашей командой поддержки.
          </p>
        </section>
      </div>
    </div>
  );
};
