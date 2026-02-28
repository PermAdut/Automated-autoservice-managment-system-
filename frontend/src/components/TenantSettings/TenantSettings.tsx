import { useState, useEffect } from "react";
import {
  useGetTenantSettingsQuery,
  useUpdateTenantSettingsMutation,
} from "../../api/tenantApi";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import { cn } from "../../lib/utils";
import {
  SettingOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  BgColorsOutlined,
  AppstoreOutlined,
  ApiOutlined,
  BankOutlined,
} from "@ant-design/icons";

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

const tabs = [
  { id: "company", label: "Компания", icon: <BankOutlined /> },
  { id: "branding", label: "Брендинг", icon: <BgColorsOutlined /> },
  { id: "features", label: "Функции", icon: <AppstoreOutlined /> },
  { id: "integrations", label: "Интеграции", icon: <ApiOutlined /> },
] as const;

export default function TenantSettings() {
  const { data: settings, isLoading } = useGetTenantSettingsQuery();
  const [update, { isLoading: isSaving, isSuccess }] = useUpdateTenantSettingsMutation();

  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [activeTab, setActiveTab] = useState<"company" | "branding" | "features" | "integrations">("company");

  useEffect(() => {
    if (settings) setForm(settings as any);
  }, [settings]);

  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="space-y-4">
          <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-20 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
            <SettingOutlined className="text-base" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Настройки системы</h1>
        </div>
        <Button onClick={() => update(form as any)} disabled={isSaving}>
          <SaveOutlined className="mr-1.5" />
          {isSaving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>

      {isSuccess && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-800 text-sm">
          <CheckCircleOutlined className="text-green-600" />
          Настройки успешно сохранены
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer border-none",
              activeTab === t.id
                ? "bg-white text-indigo-700 shadow-sm font-semibold"
                : "text-gray-500 bg-transparent hover:text-gray-700"
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Company */}
          {activeTab === "company" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label>Название компании</Label>
                <Input
                  value={(form.companyName as string) ?? ""}
                  onChange={(e) => set("companyName", e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>Слоган</Label>
                <Input
                  value={(form.tagline as string) ?? ""}
                  onChange={(e) => set("tagline", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Телефон</Label>
                <Input
                  value={(form.phone as string) ?? ""}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={(form.email as string) ?? ""}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Город</Label>
                <Input
                  value={(form.city as string) ?? ""}
                  onChange={(e) => set("city", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Часы работы</Label>
                <Input
                  value={(form.workingHours as string) ?? ""}
                  placeholder="09:00 — 21:00"
                  onChange={(e) => set("workingHours", e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>Адрес</Label>
                <Input
                  value={(form.address as string) ?? ""}
                  onChange={(e) => set("address", e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>Сайт</Label>
                <Input
                  value={(form.website as string) ?? ""}
                  onChange={(e) => set("website", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Валюта</Label>
                <Select
                  value={(form.currency as string) ?? "RUB"}
                  onChange={(e) => set("currency", e.target.value)}
                >
                  <option value="RUB">₽ Рубль (RUB)</option>
                  <option value="USD">$ Доллар (USD)</option>
                  <option value="EUR">€ Евро (EUR)</option>
                  <option value="KZT">₸ Тенге (KZT)</option>
                  <option value="UAH">₴ Гривна (UAH)</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Часовой пояс</Label>
                <Select
                  value={(form.timezone as string) ?? "Europe/Moscow"}
                  onChange={(e) => set("timezone", e.target.value)}
                >
                  <option value="Europe/Moscow">Москва (UTC+3)</option>
                  <option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</option>
                  <option value="Asia/Novosibirsk">Новосибирск (UTC+7)</option>
                  <option value="Asia/Vladivostok">Владивосток (UTC+10)</option>
                  <option value="Europe/Kiev">Киев (UTC+2)</option>
                  <option value="Asia/Almaty">Алматы (UTC+6)</option>
                </Select>
              </div>
            </div>
          )}

          {/* Branding */}
          {activeTab === "branding" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>URL логотипа</Label>
                <Input
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
              <div className="space-y-1.5">
                <Label>URL фавикона</Label>
                <Input
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
                  <div key={key} className="space-y-1.5">
                    <Label>{label}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={(form[key] as string) ?? "#4f46e5"}
                        onChange={(e) => set(key, e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                      />
                      <input
                        className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={(form[key] as string) ?? ""}
                        onChange={(e) => set(key, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {/* Preview */}
              <div
                className="rounded-xl p-5 text-white shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${form.primaryColor ?? "#4f46e5"}, ${form.secondaryColor ?? "#0ea5e9"})`,
                }}
              >
                <p className="text-lg font-bold">{(form.companyName as string) || "Название компании"}</p>
                <p className="opacity-75 text-sm mt-1">{(form.tagline as string) || "Слоган компании"}</p>
              </div>
            </div>
          )}

          {/* Features */}
          {activeTab === "features" && (
            <div className="space-y-2">
              {FEATURES.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
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
                      className={cn(
                        "w-11 h-6 rounded-full transition-colors",
                        form[key] ? "bg-indigo-600" : "bg-gray-200"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                          form[key] ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Integrations */}
          {activeTab === "integrations" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                Данные хранятся в переменных окружения сервера. Здесь отображается только статус интеграций.
              </p>
              {[
                {
                  name: "SMS.ru",
                  desc: "SMS_RU_API_ID",
                  enabled: form.featureSmsNotifications as boolean,
                },
                {
                  name: "SMTP Email",
                  desc: "SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS",
                  enabled: form.featureEmailNotifications as boolean,
                },
                {
                  name: "Google OAuth",
                  desc: "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET",
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
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{integration.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{integration.desc}</p>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-full",
                      integration.enabled
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {integration.enabled ? "Включено" : "Выключено"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
