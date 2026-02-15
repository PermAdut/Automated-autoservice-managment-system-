import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../../api/baseApi";
import { serverConfig } from "../../configs/serverConfig";

const inputClass =
  "px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10";
const labelClass = "text-sm font-semibold text-gray-600";

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
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-8 bg-gradient-to-br from-primary to-primary-dark">
      <div className="bg-white rounded-2xl p-10 shadow-2xl w-full max-w-lg animate-[slideUp_0.3s_ease-out]">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Регистрация
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className={labelClass}>Имя *</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="Иван" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="surName" className={labelClass}>Фамилия *</label>
              <input id="surName" name="surName" value={form.surName} onChange={handleChange} required className={inputClass} placeholder="Иванов" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="login" className={labelClass}>Логин *</label>
            <input id="login" name="login" value={form.login} onChange={handleChange} required className={inputClass} placeholder="ivanov" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className={labelClass}>Email *</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="ivan@mail.com" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className={labelClass}>Пароль *</label>
            <input id="password" name="password" type="password" minLength={6} value={form.password} onChange={handleChange} required className={inputClass} placeholder="Минимум 6 символов" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className={labelClass}>Телефон</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="+375 29 123-45-67" />
          </div>

          <div className="border-t border-gray-200 pt-4 mt-2">
            <h3 className="text-base font-semibold text-gray-700 mb-3">Паспортные данные</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="passportIdentityNumber" className={labelClass}>Номер паспорта *</label>
                <input id="passportIdentityNumber" name="passportIdentityNumber" value={form.passportIdentityNumber} onChange={handleChange} required className={inputClass} placeholder="AB1234567" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="passportBirthDate" className={labelClass}>Дата рождения *</label>
                  <input id="passportBirthDate" name="passportBirthDate" type="date" value={form.passportBirthDate} onChange={handleChange} max={today} required className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="passportGender" className={labelClass}>Пол *</label>
                  <select id="passportGender" name="passportGender" value={form.passportGender} onChange={handleChange} className={inputClass}>
                    <option value="M">Мужской</option>
                    <option value="F">Женский</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="py-3.5 bg-gradient-to-br from-primary to-primary-dark text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all mt-2 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-b border-gray-200" />
          <span className="px-4 text-gray-500 text-sm">или</span>
          <div className="flex-1 border-b border-gray-200" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3.5 bg-white text-gray-600 border-2 border-gray-200 rounded-lg text-base font-semibold cursor-pointer transition-all flex items-center justify-center gap-3 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md"
        >
          Войти через Google
        </button>
      </div>
    </div>
  );
};

export default Register;
