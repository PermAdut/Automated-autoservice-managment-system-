import React from "react";
import {
  useSubscribeToEmployeeMutation,
  useUnsubscribeFromEmployeeMutation,
  useGetUserSubscriptionQuery,
} from "../../../api/employeesApi";
import "./SubscribeModal.css";

interface SubscribeModalProps {
  employeeId: number;
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Подписка на рабочего</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>
            {isSubscribed
              ? `Вы подписаны на уведомления о доступности рабочего ${employeeName}.`
              : `Подпишитесь на уведомления о доступности рабочего ${employeeName}. Вы будете получать уведомления, когда рабочий станет доступен.`}
          </p>
          {subscriptionData?.subscription && (
            <div className="subscription-info">
              <p>
                <strong>Подписка активна до:</strong>{" "}
                {new Date(
                  subscriptionData.subscription.dateEnd
                ).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button
            className={`btn ${isSubscribed ? "btn-danger" : "btn-primary"}`}
            onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
            disabled={isLoading}
          >
            {isLoading
              ? "Загрузка..."
              : isSubscribed
              ? "Отписаться"
              : "Подписаться"}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

