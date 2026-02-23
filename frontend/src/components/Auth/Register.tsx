import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  IdcardOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { useRegisterMutation } from "../../api/baseApi";
import { serverConfig } from "../../configs/serverConfig";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const Register = () => {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    login: "",
    email: "",
    password: "",
    name: "",
    surName: "",
    phone: "",
    passportIdentityNumber: "",
    passportBirthDate: "",
    passportGender: "M" as "M" | "F",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(form).unwrap();
      navigate("/");
    } catch (err) {
      const error = err as { data?: { message?: string } };
      setError(error.data?.message || "Ошибка регистрации");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${serverConfig.url}/auth/google`;
  };

  const fieldClass = "pl-9";

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-6">
      <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-lg border border-gray-100 animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 text-2xl mb-4">
            <IdcardOutlined />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Регистрация</h2>
          <p className="text-sm text-gray-500 mt-1">Создайте аккаунт для доступа к системе</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Имя *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <UserOutlined />
                </span>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Иван"
                  className={fieldClass}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="surName">Фамилия *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <UserOutlined />
                </span>
                <Input
                  id="surName"
                  name="surName"
                  value={form.surName}
                  onChange={handleChange}
                  required
                  placeholder="Иванов"
                  className={fieldClass}
                />
              </div>
            </div>
          </div>

          {/* Login */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login">Логин *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <UserOutlined />
              </span>
              <Input
                id="login"
                name="login"
                value={form.login}
                onChange={handleChange}
                required
                placeholder="ivanov"
                className={fieldClass}
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <MailOutlined />
              </span>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="ivan@mail.com"
                className={fieldClass}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Пароль *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <LockOutlined />
              </span>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={6}
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Минимум 6 символов"
                className={fieldClass}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Телефон</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <PhoneOutlined />
              </span>
              <Input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+7 999 123-45-67"
                className={fieldClass}
              />
            </div>
          </div>

          {/* Passport section */}
          <div className="border-t border-gray-100 pt-4 mt-1">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
              <IdcardOutlined />
              Паспортные данные
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="passportIdentityNumber">Номер паспорта *</Label>
                <Input
                  id="passportIdentityNumber"
                  name="passportIdentityNumber"
                  value={form.passportIdentityNumber}
                  onChange={handleChange}
                  required
                  placeholder="AB1234567"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="passportBirthDate">Дата рождения *</Label>
                  <Input
                    id="passportBirthDate"
                    name="passportBirthDate"
                    type="date"
                    value={form.passportBirthDate}
                    onChange={handleChange}
                    max={today}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="passportGender">Пол *</Label>
                  <select
                    id="passportGender"
                    name="passportGender"
                    value={form.passportGender}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    <option value="M">Мужской</option>
                    <option value="F">Женский</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} size="lg" className="mt-1">
            {isLoading ? "Регистрируемся..." : "Зарегистрироваться"}
          </Button>
        </form>

        <div className="flex items-center my-5">
          <div className="flex-1 border-b border-gray-200" />
          <span className="px-4 text-gray-400 text-xs font-medium">или</span>
          <div className="flex-1 border-b border-gray-200" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full gap-2"
          onClick={handleGoogleLogin}
        >
          <GoogleOutlined style={{ color: "#4285F4", fontSize: 18 }} />
          Войти через Google
        </Button>
      </div>
    </div>
  );
};

export default Register;
