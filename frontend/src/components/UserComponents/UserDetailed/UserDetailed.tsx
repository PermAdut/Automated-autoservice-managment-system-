import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetUserByIdQuery } from "../../../api/usersApi";
import { getOrderStatusLabel } from "../../../utils/orderStatus";

const ITEMS_PER_PAGE = 1;

const paginationBtnClass =
  "px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md bg-white text-blue-600 cursor-pointer transition-all hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed";

export const DetailedUserComponent: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const {
    data: detailedUser,
    isLoading: loading,
    error,
  } = useGetUserByIdQuery(userId || "", { skip: !userId });

  const [subscriptionsPage, setSubscriptionsPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [carsPage, setCarsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);

  const handleClose = () => {
    navigate(-1);
  };

  if (loading)
    return <div className="p-8 text-center text-xl text-gray-700">Загрузка...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-xl text-red-500">
        Ошибка:{" "}
        {error && "status" in error
          ? String(error.status)
          : "Неизвестная ошибка"}
      </div>
    );
  if (!detailedUser) return null;

  const paginate = <T,>(items: T[] | undefined, page: number): T[] => {
    if (!items || items.length === 0) return [];
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return items.slice(start, end);
  };

  const getTotalPages = (items: unknown[] | undefined): number =>
    items ? Math.ceil(items.length / ITEMS_PER_PAGE) : 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-[600px] w-[90%] max-h-[80vh] overflow-y-auto shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2.5 right-2.5 text-2xl bg-transparent border-none cursor-pointer text-gray-500 transition-colors hover:text-gray-800"
          onClick={handleClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center">
          {detailedUser.name} {detailedUser.surName}
        </h2>

        <div className="mb-5">
          <h3 className="text-xl font-semibold text-gray-700 mb-2.5">Общая информация</h3>
          <p className="text-gray-500 my-1.5"><strong className="text-gray-800">ID:</strong> {detailedUser.id}</p>
          <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Роль:</strong> {detailedUser.role.name}</p>
          <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Логин:</strong> {detailedUser.login}</p>
          <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Email:</strong> {detailedUser.email}</p>
          <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Телефон:</strong> {detailedUser.phone}</p>
          <p className="text-gray-500 my-1.5">
            <strong className="text-gray-800">Дата создания:</strong>{" "}
            {new Date(detailedUser.createdAt).toLocaleString()}
          </p>
          <p className="text-gray-500 my-1.5">
            <strong className="text-gray-800">Дата обновления:</strong>{" "}
            {detailedUser.updatedAt
              ? new Date(detailedUser.updatedAt).toLocaleString()
              : "Нет"}
          </p>
        </div>

        {detailedUser.passport && (
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-gray-700 mb-2.5">Паспортные данные</h3>
            <p className="text-gray-500 my-1.5">
              <strong className="text-gray-800">Номер:</strong> {detailedUser.passport.identityNumber}
            </p>
            <p className="text-gray-500 my-1.5">
              <strong className="text-gray-800">Дата рождения:</strong>{" "}
              {new Date(detailedUser.passport.birthDate).toLocaleDateString()}
            </p>
            <p className="text-gray-500 my-1.5">
              <strong className="text-gray-800">Пол:</strong>{" "}
              {detailedUser.passport.gender === "M" ? "Мужской" : "Женский"}
            </p>
          </div>
        )}

        {detailedUser.subscriptions && detailedUser.subscriptions.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-gray-700 mb-2.5">Подписки</h3>
            {paginate(detailedUser.subscriptions, subscriptionsPage).map((sub, index) => (
              <div key={index} className="p-2.5 border border-gray-200 rounded-lg mb-2.5 bg-gray-50">
                <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Название:</strong> {sub.subscriptionName}</p>
                <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Описание:</strong> {sub.subscriptionDescription || "Нет"}</p>
                <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Дата начала:</strong> {new Date(sub.dateStart).toLocaleDateString()}</p>
                <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Дата окончания:</strong> {new Date(sub.dateEnd).toLocaleDateString()}</p>
              </div>
            ))}
            {getTotalPages(detailedUser.subscriptions) > 1 && (
              <div className="flex justify-center items-center gap-2.5 mt-2.5">
                <button
                  className={paginationBtnClass}
                  onClick={() => setSubscriptionsPage((prev) => Math.max(prev - 1, 1))}
                  disabled={subscriptionsPage === 1}
                >Назад</button>
                <span className="text-sm font-medium text-gray-700">
                  {subscriptionsPage} / {getTotalPages(detailedUser.subscriptions)}
                </span>
                <button
                  className={paginationBtnClass}
                  onClick={() => setSubscriptionsPage((prev) => Math.min(prev + 1, getTotalPages(detailedUser.subscriptions)))}
                  disabled={subscriptionsPage === getTotalPages(detailedUser.subscriptions)}
                >Вперед</button>
              </div>
            )}
          </div>
        )}

        {detailedUser.reviews && detailedUser.reviews.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-gray-700 mb-2.5">Отзывы</h3>
            {paginate(detailedUser.reviews, reviewsPage).map((review, index) => (
              <div key={index} className="p-2.5 border border-gray-200 rounded-lg mb-2.5 bg-gray-50">
                <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Описание:</strong> {review.description || "Нет"}</p>
                <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Оценка:</strong> {review.rate}/5</p>
                <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Создан:</strong> {new Date(review.createdAt).toLocaleString()}</p>
                <p className="text-gray-500 my-1.5">
                  <strong className="text-gray-800">Обновлён:</strong>{" "}
                  {review.updatedAt ? new Date(review.updatedAt).toLocaleString() : "Нет"}
                </p>
                <p className="text-gray-500 my-1.5">
                  <strong className="text-gray-800">Удалён:</strong>{" "}
                  {review.deletedAt ? new Date(review.deletedAt).toLocaleString() : "Нет"}
                </p>
              </div>
            ))}
            {getTotalPages(detailedUser.reviews) > 1 && (
              <div className="flex justify-center items-center gap-2.5 mt-2.5">
                <button
                  className={paginationBtnClass}
                  onClick={() => setReviewsPage((prev) => Math.max(prev - 1, 1))}
                  disabled={reviewsPage === 1}
                >Назад</button>
                <span className="text-sm font-medium text-gray-700">
                  {reviewsPage} / {getTotalPages(detailedUser.reviews)}
                </span>
                <button
                  className={paginationBtnClass}
                  onClick={() => setReviewsPage((prev) => Math.min(prev + 1, getTotalPages(detailedUser.reviews)))}
                  disabled={reviewsPage === getTotalPages(detailedUser.reviews)}
                >Вперед</button>
              </div>
            )}
          </div>
        )}

        {detailedUser.cars && detailedUser.cars.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-gray-700 mb-2.5">Автомобили</h3>
            {paginate(detailedUser.cars, carsPage).map((car, index) => (
              <div key={index} className="p-2.5 border border-gray-200 rounded-lg mb-2.5 bg-gray-50">
                <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Марка:</strong> {car.brand} {car.model}</p>
                <p className="text-gray-500 my-1.5"><strong className="text-gray-800">VIN:</strong> {car.vin}</p>
                <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Номерной знак:</strong> {car.licensePlate}</p>
                <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Год:</strong> {car.year}</p>
                <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Информация:</strong> {car.information || "Нет"}</p>
              </div>
            ))}
            {getTotalPages(detailedUser.cars) > 1 && (
              <div className="flex justify-center items-center gap-2.5 mt-2.5">
                <button
                  className={paginationBtnClass}
                  onClick={() => setCarsPage((prev) => Math.max(prev - 1, 1))}
                  disabled={carsPage === 1}
                >Назад</button>
                <span className="text-sm font-medium text-gray-700">
                  {carsPage} / {getTotalPages(detailedUser.cars)}
                </span>
                <button
                  className={paginationBtnClass}
                  onClick={() => setCarsPage((prev) => Math.min(prev + 1, getTotalPages(detailedUser.cars)))}
                  disabled={carsPage === getTotalPages(detailedUser.cars)}
                >Вперед</button>
              </div>
            )}
          </div>
        )}

        {detailedUser.orders && detailedUser.orders.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-gray-700 mb-2.5">Заказы</h3>
            {paginate(detailedUser.orders, ordersPage).map((order, index) => (
              <div key={index} className="p-2.5 border border-gray-200 rounded-lg mb-2.5 bg-gray-50">
                <p className="text-gray-500 my-1.5"><strong className="text-gray-800">ID:</strong> {order.id}</p>
                <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Статус:</strong> {getOrderStatusLabel(order.status)}</p>
                <p className="text-gray-500 my-1.5"><strong className="text-gray-800">Создан:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p className="text-gray-500 my-1.5">
                  <strong className="text-gray-800">Обновлён:</strong>{" "}
                  {order.updateAt ? new Date(order.updateAt).toLocaleString() : "Нет"}
                </p>
                <p className="text-gray-500 my-1.5">
                  <strong className="text-gray-800">Завершён:</strong>{" "}
                  {order.completedAt ? new Date(order.completedAt).toLocaleString() : "Нет"}
                </p>
              </div>
            ))}
            {getTotalPages(detailedUser.orders) > 1 && (
              <div className="flex justify-center items-center gap-2.5 mt-2.5">
                <button
                  className={paginationBtnClass}
                  onClick={() => setOrdersPage((prev) => Math.max(prev - 1, 1))}
                  disabled={ordersPage === 1}
                >Назад</button>
                <span className="text-sm font-medium text-gray-700">
                  {ordersPage} / {getTotalPages(detailedUser.orders)}
                </span>
                <button
                  className={paginationBtnClass}
                  onClick={() => setOrdersPage((prev) => Math.min(prev + 1, getTotalPages(detailedUser.orders)))}
                  disabled={ordersPage === getTotalPages(detailedUser.orders)}
                >Вперед</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
