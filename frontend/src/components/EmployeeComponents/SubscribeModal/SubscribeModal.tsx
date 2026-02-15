import React from "react";
import {
  useSubscribeToEmployeeMutation,
  useUnsubscribeFromEmployeeMutation,
  useGetUserSubscriptionQuery,
} from "../../../api/employeesApi";

interface SubscribeModalProps {
  employeeId: string;
  employeeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({
  employeeId,
  employeeName,
  isOpen,
  onClose,
}) => {
  const { data: subscriptionData, isLoading: isLoadingSubscription } =
    useGetUserSubscriptionQuery(employeeId, { skip: !isOpen });
  const [subscribe, { isLoading: isSubscribing }] =
    useSubscribeToEmployeeMutation();
  const [unsubscribe, { isLoading: isUnsubscribing }] =
    useUnsubscribeFromEmployeeMutation();

  const handleSubscribe = async () => {
    try {
      await subscribe(employeeId).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to subscribe:", error);
      alert("Не удалось подписаться. Попробуйте позже.");
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribe(employeeId).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      alert("Не удалось отписаться. Попробуйте позже.");
    }
  };

  if (!isOpen) return null;

  const isSubscribed = subscriptionData?.subscribed ?? false;
  const isLoading = isLoadingSubscription || isSubscribing || isUnsubscribing;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-[500px] w-[90%] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Подписка на рабочего
          </h2>
          <button
            className="bg-transparent border-none text-3xl cursor-pointer text-gray-500 w-[30px] h-[30px] flex items-center justify-center hover:text-black"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-5">
          <p className="mb-4 text-gray-600 leading-relaxed">
            {isSubscribed
              ? `Вы подписаны на уведомления о доступности рабочего ${employeeName}.`
              : `Подпишитесь на уведомления о доступности рабочего ${employeeName}. Вы будете получать уведомления, когда рабочий станет доступен.`}
          </p>
          {subscriptionData?.subscription && (
            <div className="bg-gray-100 p-4 rounded mt-4">
              <p className="m-0 text-gray-800">
                <strong>Подписка активна до:</strong>{" "}
                {new Date(
                  subscriptionData.subscription.dateEnd
                ).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2.5 p-5 border-t border-gray-200">
          <button
            className={`px-5 py-2.5 border-none rounded-lg cursor-pointer text-base font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              isSubscribed
                ? "bg-error text-white hover:bg-red-700"
                : "bg-gradient-to-br from-primary to-primary-dark text-white hover:opacity-90"
            }`}
            onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
            disabled={isLoading}
          >
            {isLoading
              ? "Загрузка..."
              : isSubscribed
              ? "Отписаться"
              : "Подписаться"}
          </button>
          <button
            className="px-5 py-2.5 border-none rounded-lg cursor-pointer text-base font-semibold transition-colors bg-gray-400 text-white hover:bg-gray-500"
            onClick={onClose}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};
