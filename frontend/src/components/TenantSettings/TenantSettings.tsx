import { useState, useEffect } from "react";
import {
  useGetTenantSettingsQuery,
  useUpdateTenantSettingsMutation,
} from "../../api/tenantApi";

const inputClass =
  "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

const FEATURES = [
  { key: "featureOnlineBooking", label: "Онлайн-запись" },
  { key: "featureVinDecoder", label: "VIN-декодер" },
  { key: "featureLoyaltyProgram", label: "Программа лояльности" },
  { key: "featureSmsNotifications", label: "SMS-уведомления" },
  { key: "featureEmailNotifications", label: "Email-уведомления" },
  { key: "featureMultiBranch", label: "Мультифилиальность" },
  { key: "featureCorporateClients", label: "Корпоративные клиенты" },
  { key: "featurePartnerNetwork", label: "Партнёрская сеть" },
] as const;

type FeatureKey = (typeof FEATURES)[number]["key"];

export default function TenantSettings() {
  const { data: settings, isLoading } = useGetTenantSettingsQuery();
  const [update, { isLoading: isSaving, isSuccess }] =
    useUpdateTenantSettingsMutation();

  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [activeTab, setActiveTab] = useState<"company" | "branding" | "features" | "integrations">("company");

  useEffect(() => {
    if (settings) setForm(settings as any);
  }, [settings]);

  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => update(form as any);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Загрузка настроек...</div>
      </div>
    );
  }

  const tabs = [
    { id: "company", label: "Компания" },
    { id: "branding", label: "Брендинг" },
    { id: "features", label: "Функции" },
    { id: "integrations", label: "Интеграции" },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Настройки системы</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? "Сохранение..." : "Сохранить"}
        </button>
      </div>

      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-800 text-sm">
          Настройки успешно сохранены
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        {/* Company */}
        {activeTab === "company" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Название компании</label>
                <input
                  className={inputClass}
                  value={(form.companyName as string) ?? ""}
                  onChange={(e) => set("companyName", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Слоган</label>
                <input
                  className={inputClass}
                  value={(form.tagline as string) ?? ""}
                  onChange={(e) => set("tagline", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Телефон</label>
                <input
                  className={inputClass}
                  value={(form.phone as string) ?? ""}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  className={inputClass}
                  type="email"
                  value={(form.email as string) ?? ""}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Город</label>
                <input
                  className={inputClass}
                  value={(form.city as string) ?? ""}
                  onChange={(e) => set("city", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Часы работы</label>
                <input
                  className={inputClass}
                  value={(form.workingHours as string) ?? ""}
                  onChange={(e) => set("workingHours", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Адрес</label>
                <input
                  className={inputClass}
                  value={(form.address as string) ?? ""}
                  onChange={(e) => set("address", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Сайт</label>
                <input
                  className={inputClass}
                  value={(form.website as string) ?? ""}
                  onChange={(e) => set("website", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Валюта</label>
                <select
                  className={inputClass}
                  value={(form.currency as string) ?? "RUB"}
                  onChange={(e) => set("currency", e.target.value)}
                >
                  <option value="RUB">₽ Рубль (RUB)</option>
                  <option value="USD">$ Доллар (USD)</option>
                  <option value="EUR">€ Евро (EUR)</option>
                  <option value="KZT">₸ Тенге (KZT)</option>
                  <option value="UAH">₴ Гривна (UAH)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Часовой пояс</label>
                <select
                  className={inputClass}
                  value={(form.timezone as string) ?? "Europe/Moscow"}
                  onChange={(e) => set("timezone", e.target.value)}
                >
                  <option value="Europe/Moscow">Москва (UTC+3)</option>
                  <option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</option>
                  <option value="Asia/Novosibirsk">Новосибирск (UTC+7)</option>
                  <option value="Asia/Vladivostok">Владивосток (UTC+10)</option>
                  <option value="Europe/Kiev">Киев (UTC+2)</option>
                  <option value="Asia/Almaty">Алматы (UTC+6)</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Branding */}
        {activeTab === "branding" && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>URL логотипа</label>
              <input
                className={inputClass}
                placeholder="https://example.com/logo.png"
                value={(form.logoUrl as string) ?? ""}
                onChange={(e) => set("logoUrl", e.target.value)}
              />
              {form.logoUrl && (
                <img
                  src={form.logoUrl as string}
                  alt="logo preview"
                  className="mt-2 h-12 object-contain rounded"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
            </div>
            <div>
              <label className={labelClass}>URL фавикона</label>
              <input
                className={inputClass}
                placeholder="https://example.com/favicon.ico"
                value={(form.faviconUrl as string) ?? ""}
                onChange={(e) => set("faviconUrl", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {(
                [
                  { key: "primaryColor", label: "Основной цвет" },
                  { key: "secondaryColor", label: "Вторичный цвет" },
                  { key: "accentColor", label: "Акцент" },
                ] as { key: string; label: string }[]
              ).map(({ key, label }) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(form[key] as string) ?? "#4f46e5"}
                      onChange={(e) => set(key, e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                    />
                    <input
                      className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                      value={(form[key] as string) ?? ""}
                      onChange={(e) => set(key, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Preview */}
            <div
              className="rounded-xl p-5 text-white"
              style={{
                background: `linear-gradient(135deg, ${form.primaryColor ?? "#4f46e5"}, ${form.secondaryColor ?? "#0ea5e9"})`,
              }}
            >
              <p className="text-lg font-bold">{(form.companyName as string) || "Название"}</p>
              <p className="opacity-75 text-sm mt-1">{(form.tagline as string) || "Слоган"}</p>
            </div>
          </div>
        )}

        {/* Features */}
        {activeTab === "features" && (
          <div className="space-y-3">
            {FEATURES.map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-800">{label}</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={(form[key] as boolean) ?? false}
                    onChange={(e) => set(key, e.target.checked)}
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      form[key] ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        form[key] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Integrations */}
        {activeTab === "integrations" && (
          <div className="space-y-5">
            <p className="text-sm text-gray-500">
              Данные хранятся в переменных окружения сервера. Здесь — статус
              интеграций.
            </p>
            {[
              {
                name: "SMS.ru",
                desc: "Переменная: SMS_RU_API_ID",
                enabled: form.featureSmsNotifications as boolean,
              },
              {
                name: "SMTP Email",
                desc: "Переменные: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS",
                enabled: form.featureEmailNotifications as boolean,
              },
              {
                name: "Google OAuth",
                desc: "Переменные: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET",
                enabled: true,
              },
              {
                name: "NHTSA vPIC",
                desc: "VIN-декодер (бесплатно, ключ не нужен)",
                enabled: form.featureVinDecoder as boolean,
              },
            ].map((integration) => (
              <div
                key={integration.name}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {integration.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{integration.desc}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    integration.enabled
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {integration.enabled ? "Включено" : "Выключено"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
