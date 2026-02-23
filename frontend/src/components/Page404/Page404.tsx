import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { HomeOutlined } from "@ant-design/icons";

export default function Page404() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="text-8xl font-black text-gray-100 leading-none select-none">
        404
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
        Страница не найдена
      </h1>
      <p className="text-gray-500 mb-6 max-w-sm">
        Запрашиваемая страница не существует или была перемещена.
      </p>
      <Button asChild>
        <Link to="/">
          <HomeOutlined className="mr-1.5" />
          На главную
        </Link>
      </Button>
    </div>
  );
}
