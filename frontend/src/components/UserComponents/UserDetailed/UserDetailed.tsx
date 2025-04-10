import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUsersById } from "../../../store/slices/userSlice";
import { RootState } from "../../../store";
import "./UserDetailed.css";

const ITEMS_PER_PAGE = 1;

export const DetailedUserComponent: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { detailedUser, loading, error } = useAppSelector((state: RootState) => state.user);

  const [subscriptionsPage, setSubscriptionsPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [carsPage, setCarsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUsersById(Number(userId)));
    }
  }, [dispatch, userId]);

  const handleClose = () => {
    navigate(-1);
  };

  if (loading) return <div className="detailed-user-loading">Загрузка...</div>;
  if (error) return <div className="detailed-user-error">Ошибка: {error}</div>;
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
    <div className="detailed-user-overlay" onClick={handleClose}>
      <div className="detailed-user-modal" onClick={(e) => e.stopPropagation()}>
        <button className="detailed-user-close" onClick={handleClose}>
          ×
        </button>
        <h2 className="detailed-user-title">
          {detailedUser.name} {detailedUser.surName}
        </h2>

        <div className="detailed-user-section">
          <h3>Общая информация</h3>
          <p><strong>ID:</strong> {detailedUser.id}</p>
          <p><strong>Роль:</strong> {detailedUser.role.name}</p>
          <p><strong>Логин:</strong> {detailedUser.login}</p>
          <p><strong>Email:</strong> {detailedUser.email}</p>
          <p><strong>Телефон:</strong> {detailedUser.phone}</p>
          <p>
            <strong>Дата создания:</strong>{" "}
            {new Date(detailedUser.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Дата обновления:</strong>{" "}
            {detailedUser.updatedAt
              ? new Date(detailedUser.updatedAt).toLocaleString()
              : "Нет"}
          </p>
        </div>

        {detailedUser.passport && (
          <div className="detailed-user-section">
            <h3>Паспортные данные</h3>
            <p><strong>Номер:</strong> {detailedUser.passport.identityNumber}</p>
            <p><strong>Национальность:</strong> {detailedUser.passport.nationality}</p>
            <p>
              <strong>Дата рождения:</strong>{" "}
              {new Date(detailedUser.passport.birthDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Пол:</strong>{" "}
              {detailedUser.passport.gender === "M" ? "Мужской" : "Женский"}
            </p>
            <p>
              <strong>Срок действия:</strong>{" "}
              {new Date(detailedUser.passport.expiriationDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {detailedUser.subscriptions && detailedUser.subscriptions.length > 0 && (
          <div className="detailed-user-section">
            <h3>Подписки</h3>
            {paginate(detailedUser.subscriptions, subscriptionsPage).map((sub, index) => (
              <div key={index} className="detailed-user-item">
                <p><strong>Название:</strong> {sub.subscriptionName}</p>
                <p>
                  <strong>Описание:</strong>{" "}
                  {sub.subscriptionDescription || "Нет"}
                </p>
                <p>
                  <strong>Дата начала:</strong>{" "}
                  {new Date(sub.dateStart).toLocaleDateString()}
                </p>
                <p>
                  <strong>Дата окончания:</strong>{" "}
                  {new Date(sub.dateEnd).toLocaleDateString()}
                </p>
              </div>
            ))}
            {getTotalPages(detailedUser.subscriptions) > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setSubscriptionsPage((prev) => Math.max(prev - 1, 1))}
                  disabled={subscriptionsPage === 1}
                >
                  Назад
                </button>
                <span>
                  {subscriptionsPage} / {getTotalPages(detailedUser.subscriptions)}
                </span>
                <button
                  onClick={() =>
                    setSubscriptionsPage((prev) =>
                      Math.min(prev + 1, getTotalPages(detailedUser.subscriptions))
                    )
                  }
                  disabled={subscriptionsPage === getTotalPages(detailedUser.subscriptions)}
                >
                  Вперед
                </button>
              </div>
            )}
          </div>
        )}

        {detailedUser.reviews && detailedUser.reviews.length > 0 && (
          <div className="detailed-user-section">
            <h3>Отзывы</h3>
            {paginate(detailedUser.reviews, reviewsPage).map((review, index) => (
              <div key={index} className="detailed-user-item">
                <p><strong>Описание:</strong> {review.description || "Нет"}</p>
                <p><strong>Оценка:</strong> {review.rate}/5</p>
                <p>
                  <strong>Создан:</strong>{" "}
                  {new Date(review.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Обновлён:</strong>{" "}
                  {review.updatedAt
                    ? new Date(review.updatedAt).toLocaleString()
                    : "Нет"}
                </p>
                <p>
                  <strong>Удалён:</strong>{" "}
                  {review.deletedAt
                    ? new Date(review.deletedAt).toLocaleString()
                    : "Нет"}
                </p>
              </div>
            ))}
            {getTotalPages(detailedUser.reviews) > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setReviewsPage((prev) => Math.max(prev - 1, 1))}
                  disabled={reviewsPage === 1}
                >
                  Назад
                </button>
                <span>
                  {reviewsPage} / {getTotalPages(detailedUser.reviews)}
                </span>
                <button
                  onClick={() =>
                    setReviewsPage((prev) =>
                      Math.min(prev + 1, getTotalPages(detailedUser.reviews))
                    )
                  }
                  disabled={reviewsPage === getTotalPages(detailedUser.reviews)}
                >
                  Вперед
                </button>
              </div>
            )}
          </div>
        )}

        {detailedUser.cars && detailedUser.cars.length > 0 && (
          <div className="detailed-user-section">
            <h3>Автомобили</h3>
            {paginate(detailedUser.cars, carsPage).map((car, index) => (
              <div key={index} className="detailed-user-item">
                <p><strong>Название:</strong> {car.name}</p>
                <p><strong>VIN:</strong> {car.vin}</p>
                <p><strong>Номерной знак:</strong> {car.licensePlate}</p>
                <p><strong>Год:</strong> {car.year}</p>
                <p><strong>Информация:</strong> {car.information || "Нет"}</p>
              </div>
            ))}
            {getTotalPages(detailedUser.cars) > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCarsPage((prev) => Math.max(prev - 1, 1))}
                  disabled={carsPage === 1}
                >
                  Назад
                </button>
                <span>
                  {carsPage} / {getTotalPages(detailedUser.cars)}
                </span>
                <button
                  onClick={() =>
                    setCarsPage((prev) =>
                      Math.min(prev + 1, getTotalPages(detailedUser.cars))
                    )
                  }
                  disabled={carsPage === getTotalPages(detailedUser.cars)}
                >
                  Вперед
                </button>
              </div>
            )}
          </div>
        )}

        {detailedUser.orders && detailedUser.orders.length > 0 && (
          <div className="detailed-user-section">
            <h3>Заказы</h3>
            {paginate(detailedUser.orders, ordersPage).map((order, index) => (
              <div key={index} className="detailed-user-item">
                <p><strong>ID:</strong> {order.id}</p>
                <p><strong>Статус:</strong> {order.status}</p>
                <p>
                  <strong>Создан:</strong>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Обновлён:</strong>{" "}
                  {order.updateAt
                    ? new Date(order.updateAt).toLocaleString()
                    : "Нет"}
                </p>
                <p>
                  <strong>Завершён:</strong>{" "}
                  {order.completedAt
                    ? new Date(order.completedAt).toLocaleString()
                    : "Нет"}
                </p>
              </div>
            ))}
            {getTotalPages(detailedUser.orders) > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setOrdersPage((prev) => Math.max(prev - 1, 1))}
                  disabled={ordersPage === 1}
                >
                  Назад
                </button>
                <span>
                  {ordersPage} / {getTotalPages(detailedUser.orders)}
                </span>
                <button
                  onClick={() =>
                    setOrdersPage((prev) =>
                      Math.min(prev + 1, getTotalPages(detailedUser.orders))
                    )
                  }
                  disabled={ordersPage === getTotalPages(detailedUser.orders)}
                >
                  Вперед
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};