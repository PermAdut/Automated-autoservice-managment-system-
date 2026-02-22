import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUpdateTenantSettingsMutation, useCompleteSetupMutation } from "../../api/tenantApi";

const STEPS = [
  { id: 1, title: "Компания", description: "Название и контакты" },
  { id: 2, title: "Брендинг", description: "Логотип и цвета" },
  { id: 3, title: "Функции", description: "Включите нужные модули" },
  { id: 4, title: "Готово", description: "Запуск системы" },
];

const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

interface FormData {
  companyName: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  workingHours: string;
  website: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  featureOnlineBooking: boolean;
  featureVinDecoder: boolean;
  featureLoyaltyProgram: boolean;
  featureSmsNotifications: boolean;
  featureEmailNotifications: boolean;
  featureMultiBranch: boolean;
  featureCorporateClients: boolean;
  featurePartnerNetwork: boolean;
}

export default function SetupWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    companyName: "",
    tagline: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    workingHours: "Пн-Сб: 9:00-19:00",
    website: "",
    logoUrl: "",
    primaryColor: "#4f46e5",
    secondaryColor: "#0ea5e9",
    accentColor: "#10b981",
    featureOnlineBooking: true,
    featureVinDecoder: true,
    featureLoyaltyProgram: true,
    featureSmsNotifications: false,
    featureEmailNotifications: false,
    featureMultiBranch: false,
    featureCorporateClients: false,
    featurePartnerNetwork: false,
  });

  const [updateSettings, { isLoading: isSaving }] = useUpdateTenantSettingsMutation();
  const [completeSetup, { isLoading: isCompleting }] = useCompleteSetupMutation();

  const set = (key: keyof FormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleNext = async () => {
    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }
    // Step 3 → save + complete
    await updateSettings(form as any);
    await completeSetup();
    setStep(4);
  };

  const handleFinish = () => navigate("/");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl overflow-hidden">
        {/* Progress header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-8 py-6">
          <h1 className="text-white text-xl font-bold mb-4">Первоначальная настройка</h1>
          <div className="flex gap-2">
            {STEPS.map((s) => (
              <div key={s.id} className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    s.id <= step ? "bg-white" : "bg-white/30"
                  }`}
                />
                <p className={`text-xs mt-1 ${s.id <= step ? "text-white" : "text-white/50"}`}>
                  {s.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">
          {/* Step 1: Company info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {STEPS[0].description}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>Название автосервиса *</label>
                  <input
                    className={inputClass}
                    placeholder='Например: "Автосервис Иванова"'
                    value={form.companyName}
                    onChange={(e) => set("companyName", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Слоган</label>
                  <input
                    className={inputClass}
                    placeholder="Качество и скорость — наш приоритет"
                    value={form.tagline}
                    onChange={(e) => set("tagline", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Телефон</label>
                  <input
                    className={inputClass}
                    placeholder="+7 (999) 123-45-67"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    className={inputClass}
                    type="email"
                    placeholder="info@myservice.ru"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Город</label>
                  <input
                    className={inputClass}
                    placeholder="Москва"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Часы работы</label>
                  <input
                    className={inputClass}
                    placeholder="Пн-Сб: 9:00-19:00"
                    value={form.workingHours}
                    onChange={(e) => set("workingHours", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Адрес</label>
                  <input
                    className={inputClass}
                    placeholder="ул. Ленина, д. 1"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Branding */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {STEPS[1].description}
              </h2>
              <div>
                <label className={labelClass}>URL логотипа</label>
                <input
                  className={inputClass}
                  placeholder="https://example.com/logo.png"
                  value={form.logoUrl}
                  onChange={(e) => set("logoUrl", e.target.value)}
                />
                {form.logoUrl && (
                  <img
                    src={form.logoUrl}
                    alt="preview"
                    className="mt-2 h-12 object-contain rounded"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {(
                  [
                    { key: "primaryColor", label: "Основной цвет" },
                    { key: "secondaryColor", label: "Вторичный цвет" },
                    { key: "accentColor", label: "Акцент" },
                  ] as { key: keyof FormData; label: string }[]
                ).map(({ key, label }) => (
                  <div key={key}>
                    <label className={labelClass}>{label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form[key] as string}
                        onChange={(e) => set(key, e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                      />
                      <input
                        className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                        value={form[key] as string}
                        onChange={(e) => set(key, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="rounded-xl p-4 text-white text-sm font-medium"
                style={{ background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})` }}
              >
                <p className="text-lg font-bold">{form.companyName || "Мой Автосервис"}</p>
                <p className="opacity-80">{form.tagline || "Предварительный просмотр"}</p>
                <div
                  className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: form.accentColor }}
                >
                  Записаться
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Features */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">{STEPS[2].description}</h2>
              <p className="text-sm text-gray-500">
                Включите только нужные модули. Все можно изменить позже в настройках.
              </p>
              <div className="space-y-3">
                {(
                  [
                    { key: "featureOnlineBooking", label: "Онлайн-запись", desc: "Клиенты могут записываться через сайт" },
                    { key: "featureVinDecoder", label: "VIN-декодер", desc: "Проверка авто по VIN через NHTSA API" },
                    { key: "featureLoyaltyProgram", label: "Программа лояльности", desc: "Бонусные баллы и тиры" },
                    { key: "featureSmsNotifications", label: "SMS уведомления", desc: "Требуется API ID от SMS.ru" },
                    { key: "featureEmailNotifications", label: "Email уведомления", desc: "Требуется SMTP-сервер" },
                    { key: "featureMultiBranch", label: "Мультифилиальность", desc: "Несколько точек в одной системе" },
                    { key: "featureCorporateClients", label: "Корпоративные клиенты", desc: "Компании, договоры, автопарки" },
                    { key: "featurePartnerNetwork", label: "Партнёрская сеть", desc: "Обмен запчастями между автосервисами" },
                  ] as { key: keyof FormData; label: string; desc: string }[]
                ).map(({ key, label, desc }) => (
                  <label
                    key={key}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={form[key] as boolean}
                      onChange={(e) => set(key, e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Всё готово!</h2>
              <p className="text-gray-500 mb-6">
                Система настроена и готова к работе. Вы можете изменить любые настройки в панели администратора.
              </p>
              <button
                onClick={handleFinish}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Перейти в систему
              </button>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 1}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Назад
              </button>
              <button
                onClick={handleNext}
                disabled={isSaving || isCompleting || (step === 1 && !form.companyName.trim())}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {step === 3 ? (isSaving || isCompleting ? "Сохранение..." : "Завершить") : "Далее"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
