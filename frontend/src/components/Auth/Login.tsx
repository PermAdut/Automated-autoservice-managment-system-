import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../api/baseApi";
import { Link } from "react-router-dom";
import { serverConfig } from "../../configs/serverConfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login({ email, password }).unwrap();
      navigate("/");
    } catch (err) {
      const error = err as { data?: { message?: string } };
      setError(error.data?.message || "Ошибка входа. Проверьте данные.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${serverConfig.url}/auth/google`;
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-8 bg-gradient-to-br from-primary to-primary-dark">
      <div className="bg-white rounded-2xl p-10 shadow-2xl w-full max-w-md animate-[slideUp_0.3s_ease-out]">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Вход в систему
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-600">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Введите email"
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-600">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Введите пароль"
              minLength={6}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
            />
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
            {isLoading ? "Вход..." : "Войти"}
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
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Войти через Google
        </button>

        <div className="mt-4 text-center text-gray-600 text-sm">
          Еще не зарегистрированы?{" "}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
