import React, { useState } from "react";
import {
  useSubscribeToEmployeeMutation,
  useUnsubscribeFromEmployeeMutation,
  useGetUserSubscriptionQuery,
} from "../../../api/employeesApi";
import { SubscribeModal } from "../SubscribeModal/SubscribeModal";
import { ReviewModal } from "../ReviewModal/ReviewModal";
import { getOrderStatusLabel } from "../../../utils/orderStatus";

interface EmployeeItemProps {
  id: string;
  name: string;
  surName: string;
  lastName?: string | null;
  position: { id: string; name: string; description?: string };
  orders?: { id: string; status: string };
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

  const {
    data: subscriptionData,
    refetch: refetchSubscription,
  } = useGetUserSubscriptionQuery(id, {
    skip: !isAuthenticated,
  });

  React.useEffect(() => {
    if (subscriptionData !== undefined) {
      setLocalSubscriptionStatus(subscriptionData.subscribed);
    }
  }, [subscriptionData]);

  const [subscribe, { isLoading: isSubscribing }] =
    useSubscribeToEmployeeMutation();
  const [unsubscribe, { isLoading: isUnsubscribing }] =
    useUnsubscribeFromEmployeeMutation();

  const isSubscribed = localSubscriptionStatus !== null
    ? localSubscriptionStatus
    : (subscriptionData?.subscribed ?? false);

  const handleQuickSubscribe = async () => {
    try {
      setLocalSubscriptionStatus(true);
      const result = await subscribe(id).unwrap();
      console.log("Subscribe result:", result);
      await refetchSubscription();
    } catch (error: any) {
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
      setLocalSubscriptionStatus(false);
      const result = await unsubscribe(id).unwrap();
      console.log("Unsubscribe result:", result);
      await refetchSubscription();
    } catch (error: any) {
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
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 m-0">
          {surName} {name} {lastName ?? ""}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          ID: {id.slice(0, 8)} · Должность: {position.name}
        </p>
      </div>

      <div className="[&_p]:text-base [&_p]:text-gray-500 [&_p]:my-1 [&_strong]:text-gray-800">
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

      <div className="mt-4 [&_p]:text-base [&_p]:text-gray-500 [&_p]:my-1 [&_strong]:text-gray-800">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Текущий заказ</h3>
        <p>
          <strong>ID заказа:</strong> {orders?.id ? orders.id.slice(0, 8) : "Нет заказа"}
        </p>
            <p>
              <strong>Статус:</strong> {orders?.status ? getOrderStatusLabel(orders.status) : "Нет заказа"}
            </p>
      </div>

      <div className="mt-4 [&_p]:text-base [&_p]:text-gray-500 [&_p]:my-1 [&_strong]:text-gray-800">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Расписание</h3>
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
        <div className="mt-5 pt-5 border-t border-gray-200 flex gap-2.5 flex-wrap">
          {isSubscribed ? (
            <>
              <button
                className="px-5 py-2.5 border-none rounded-md text-sm font-medium cursor-pointer transition-all bg-error text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleQuickUnsubscribe}
                disabled={isUnsubscribing}
              >
                {isUnsubscribing ? "Отписка..." : "Отписаться от уведомлений"}
              </button>
              <button
                className="px-5 py-2.5 border-none rounded-md text-sm font-medium cursor-pointer transition-all bg-gray-400 text-white hover:bg-gray-500"
                onClick={() => setIsSubscribeModalOpen(true)}
              >
                Управление подпиской
              </button>
            </>
          ) : (
            <>
              <button
                className="px-5 py-2.5 border-none rounded-md text-sm font-medium cursor-pointer transition-all bg-primary text-white hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleQuickSubscribe}
                disabled={isSubscribing}
              >
                {isSubscribing ? "Подписка..." : "Подписаться на уведомления"}
              </button>
              <button
                className="px-5 py-2.5 border-none rounded-md text-sm font-medium cursor-pointer transition-all bg-gray-400 text-white hover:bg-gray-500"
                onClick={() => setIsSubscribeModalOpen(true)}
              >
                Подробнее о подписке
              </button>
            </>
          )}
          <button
            className="px-5 py-2.5 border-none rounded-md text-sm font-medium cursor-pointer transition-all bg-success text-white hover:bg-green-600"
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
