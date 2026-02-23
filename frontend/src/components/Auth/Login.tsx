import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LockOutlined, MailOutlined, GoogleOutlined } from "@ant-design/icons";
import { useLoginMutation } from "../../api/baseApi";
import { serverConfig } from "../../configs/serverConfig";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-6">
      <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md border border-gray-100 animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 text-2xl mb-4">
            <LockOutlined />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Вход в систему</h2>
          <p className="text-sm text-gray-500 mt-1">Введите ваши данные для входа</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <MailOutlined />
              </span>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ivan@mail.com"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <LockOutlined />
              </span>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Минимум 6 символов"
                minLength={6}
                className="pl-9"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} size="lg" className="mt-1">
            {isLoading ? "Входим..." : "Войти"}
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

        <p className="mt-5 text-center text-gray-500 text-sm">
          Ещё не зарегистрированы?{" "}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Создать аккаунт
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
