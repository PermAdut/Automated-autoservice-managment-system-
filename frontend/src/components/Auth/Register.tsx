import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../../api/baseApi";
import "./Login.css";

const Register = () => {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    login: "",
    email: "",
    password: "",
    name: "",
    surName: "",
    phone: "",
    passportIdentityNumber: "",
    passportNationality: "",
    passportBirthDate: "",
    passportGender: "M" as "M" | "F",
    passportExpirationDate: "",
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
    window.location.href = `${
      import.meta.env.VITE_SERVER_URL || "http://localhost:3333"
    }/auth/google`;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Регистрация</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="login">Логин</label>
            <input
              id="login"
              name="login"
              value={form.login}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Имя</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="surName">Фамилия</label>
            <input
              id="surName"
              name="surName"
              value={form.surName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Телефон</label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="passportIdentityNumber">Номер паспорта</label>
            <input
              id="passportIdentityNumber"
              name="passportIdentityNumber"
              value={form.passportIdentityNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="passportNationality">Гражданство</label>
            <input
              id="passportNationality"
              name="passportNationality"
              value={form.passportNationality}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="passportBirthDate">Дата рождения</label>
            <input
              id="passportBirthDate"
              name="passportBirthDate"
              type="date"
              value={form.passportBirthDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="passportGender">Пол</label>
            <select
              id="passportGender"
              name="passportGender"
              value={form.passportGender}
              onChange={handleChange}
            >
              <option value="M">М</option>
              <option value="F">Ж</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="passportExpirationDate">Срок действия</label>
            <input
              id="passportExpirationDate"
              name="passportExpirationDate"
              type="date"
              value={form.passportExpirationDate}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>
        <div className="divider">
          <span>или</span>
        </div>
        <button onClick={handleGoogleLogin} className="google-button">
          Войти через Google
        </button>
      </div>
    </div>
  );
};

export default Register;
