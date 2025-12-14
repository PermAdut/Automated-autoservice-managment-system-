import React, { useState } from "react";
import {
  useSubscribeToEmployeeMutation,
  useUnsubscribeFromEmployeeMutation,
  useGetUserSubscriptionQuery,
} from "../../../api/employeesApi";
import { SubscribeModal } from "../SubscribeModal/SubscribeModal";
import { ReviewModal } from "../ReviewModal/ReviewModal";
import { getOrderStatusLabel } from "../../../utils/orderStatus";
import "./EmployeeItem.css";

interface EmployeeItemProps {
  id: number;
  name: string;
  surName: string;
  lastName?: string | null;
  position: { id: number; name: string; description?: string };
  orders?: { id: number; status: string };
  schedule?: { startTime: string; endTime: string; isAvailable: boolean };
  hireDate: string;
  salary: number;
  showAdminInfo?: boolean;
}

const formatScheduleTime = (timeString?: string) => {
  if (!timeString) return "Не указано";
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return "Не указано";

  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;
  if (isWeekend) return "Выходной";

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const EmployeeItem: React.FC<EmployeeItemProps> = ({
  id,
  name,
  surName,
  lastName,
  position,
  orders,
  schedule,
  hireDate,
  salary,
  showAdminInfo = false,
}) => {
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [localSubscriptionStatus, setLocalSubscriptionStatus] = useState<boolean | null>(null);
  const isAuthenticated = !!localStorage.getItem("access_token");
  const fullName = `${surName} ${name} ${lastName ?? ""}`.trim();

  // Проверяем статус подписки
  const {
    data: subscriptionData,
    refetch: refetchSubscription,
    error: subscriptionError,
    isLoading: isLoadingSubscription,
  } = useGetUserSubscriptionQuery(id, {
    skip: !isAuthenticated,
  });

  // Обновляем локальное состояние при изменении данных из API
  React.useEffect(() => {
    if (subscriptionData !== undefined) {
      setLocalSubscriptionStatus(subscriptionData.subscribed);
    }
  }, [subscriptionData]);
  
  const [subscribe, { isLoading: isSubscribing }] =
    useSubscribeToEmployeeMutation();
  const [unsubscribe, { isLoading: isUnsubscribing }] =
    useUnsubscribeFromEmployeeMutation();

  // Используем локальное состояние, если оно установлено, иначе данные из API
  const isSubscribed = localSubscriptionStatus !== null 
    ? localSubscriptionStatus 
    : (subscriptionData?.subscribed ?? false);

  const handleQuickSubscribe = async () => {
    try {
      // Оптимистичное обновление UI
      setLocalSubscriptionStatus(true);
      const result = await subscribe(id).unwrap();
      console.log("Subscribe result:", result);
      // Обновляем данные из API
      await refetchSubscription();
    } catch (error: any) {
      // Откатываем оптимистичное обновление при ошибке
      setLocalSubscriptionStatus(null);
      console.error("Failed to subscribe:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Не удалось подписаться. Попробуйте позже.";
      alert(errorMessage);
    }
  };

  const handleQuickUnsubscribe = async () => {
    try {
      // Оптимистичное обновление UI
      setLocalSubscriptionStatus(false);
      const result = await unsubscribe(id).unwrap();
      console.log("Unsubscribe result:", result);
      // Обновляем данные из API
      await refetchSubscription();
    } catch (error: any) {
      // Откатываем оптимистичное обновление при ошибке
      setLocalSubscriptionStatus(null);
      console.error("Failed to unsubscribe:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Не удалось отписаться. Попробуйте позже.";
      alert(errorMessage);
    }
  };

  return (
    <div className="employee-item-card">
      <div className="employee-item-header">
        <h2 className="employee-item-name">
          {surName} {name} {lastName ?? ""}
        </h2>
        <p className="employee-item-info">
          ID: {id} · Должность: {position.name}
        </p>
      </div>

      <div className="employee-item-details">
        <p>
          <strong>Описание должности:</strong>{" "}
          {position.description || "Нет описания"}
        </p>
        {showAdminInfo && (
          <p>
            <strong>Зарплата:</strong> {salary} руб.
          </p>
        )}
        {showAdminInfo && (
          <p>
            <strong>Дата найма:</strong> {new Date(hireDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="employee-item-section">
        <h3>Текущий заказ</h3>
        <p>
          <strong>ID заказа:</strong> {orders?.id ?? "Нет заказа"}
        </p>
            <p>
              <strong>Статус:</strong> {orders?.status ? getOrderStatusLabel(orders.status) : "Нет заказа"}
            </p>
      </div>

      <div className="employee-item-section">
        <h3>Расписание</h3>
        <p>
          <strong>Начало работы:</strong>{" "}
          {formatScheduleTime(schedule?.startTime)}
        </p>
        <p>
          <strong>Конец работы:</strong> {formatScheduleTime(schedule?.endTime)}
        </p>
        <p>
          <strong>Доступен:</strong>{" "}
          {schedule ? (schedule.isAvailable ? "Да" : "Нет") : "Неизвестно"}
        </p>
      </div>

      {isAuthenticated && (
        <div className="employee-item-actions">
          {isSubscribed ? (
            <>
              <button
                className="btn btn-unsubscribe"
                onClick={handleQuickUnsubscribe}
                disabled={isUnsubscribing}
              >
                {isUnsubscribing ? "Отписка..." : "Отписаться от уведомлений"}
              </button>
              <button
                className="btn btn-subscribe-info"
                onClick={() => setIsSubscribeModalOpen(true)}
              >
                Управление подпиской
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-subscribe"
                onClick={handleQuickSubscribe}
                disabled={isSubscribing}
              >
                {isSubscribing ? "Подписка..." : "Подписаться на уведомления"}
              </button>
              <button
                className="btn btn-subscribe-info"
                onClick={() => setIsSubscribeModalOpen(true)}
              >
                Подробнее о подписке
              </button>
            </>
          )}
          <button
            className="btn btn-review"
            onClick={() => setIsReviewModalOpen(true)}
          >
            Оставить отзыв
          </button>
        </div>
      )}

      <SubscribeModal
        employeeId={id}
        employeeName={fullName}
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
      />

      <ReviewModal
        employeeId={id}
        employeeName={fullName}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
};
