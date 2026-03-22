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
import { InputWithIcon } from "../ui/input-with-icon";
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

  return (
    <div className="flex flex-1 items-center justify-center py-12 px-6 sm:px-8 lg:px-12">
      <div className="bg-white rounded-2xl p-8 sm:p-10 lg:p-12 shadow-xl w-full max-w-xl sm:max-w-2xl border border-gray-100 animate-[slideUp_0.3s_ease-out] max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 text-2xl mb-5">
            <IdcardOutlined />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Регистрация</h2>
          <p className="text-sm text-gray-500 mt-2">Создайте аккаунт для доступа к системе</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Имя *</Label>
              <InputWithIcon
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Иван"
                icon={<UserOutlined />}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="surName">Фамилия *</Label>
              <InputWithIcon
                id="surName"
                name="surName"
                value={form.surName}
                onChange={handleChange}
                required
                placeholder="Иванов"
                icon={<UserOutlined />}
              />
            </div>
          </div>

          {/* Login */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="login">Логин *</Label>
            <InputWithIcon
              id="login"
              name="login"
              value={form.login}
              onChange={handleChange}
              required
              placeholder="ivanov"
              icon={<UserOutlined />}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email *</Label>
            <InputWithIcon
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="ivan@mail.com"
              icon={<MailOutlined />}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Пароль *</Label>
            <InputWithIcon
              id="password"
              name="password"
              type="password"
              minLength={6}
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Минимум 6 символов"
              icon={<LockOutlined />}
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Телефон</Label>
            <InputWithIcon
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+7 999 123-45-67"
              icon={<PhoneOutlined />}
            />
          </div>

          {/* Passport section */}
          <div className="border-t border-gray-100 pt-5 mt-2">
            <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-1.5">
              <IdcardOutlined />
              Паспортные данные
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="passportIdentityNumber">Номер паспорта *</Label>
                <InputWithIcon
                  id="passportIdentityNumber"
                  name="passportIdentityNumber"
                  value={form.passportIdentityNumber}
                  onChange={handleChange}
                  required
                  placeholder="AB1234567"
                  icon={<IdcardOutlined />}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
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
                <div className="flex flex-col gap-2">
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

          <Button type="submit" disabled={isLoading} size="lg" className="mt-2">
            {isLoading ? "Регистрируемся..." : "Зарегистрироваться"}
          </Button>
        </form>

        <div className="flex items-center my-6">
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
