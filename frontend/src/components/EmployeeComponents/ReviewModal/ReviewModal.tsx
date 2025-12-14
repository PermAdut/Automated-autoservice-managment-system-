import React, { useState, useEffect } from "react";
import {
  useCreateReviewMutation,
  useGetEmployeeReviewsQuery,
} from "../../../api/employeesApi";
import "./ReviewModal.css";

interface ReviewModalProps {
  employeeId: number;
  employeeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  employeeId,
  employeeName,
  isOpen,
  onClose,
}) => {
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState(5);
  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const { data: reviews, refetch } = useGetEmployeeReviewsQuery(employeeId, {
    skip: !isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReview({
        employeeId,
        description: description.trim() || undefined,
        rate,
      }).unwrap();
      setDescription("");
      setRate(5);
      refetch();
      alert("Отзыв успешно добавлен!");
    } catch (error) {
      console.error("Failed to create review:", error);
      alert("Не удалось добавить отзыв. Попробуйте позже.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Отзывы о рабочем {employeeName}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="review-form">
            <div className="form-group">
              <label htmlFor="rate">Оценка:</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`star-btn ${rate >= value ? "active" : ""}`}
                    onClick={() => setRate(value)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="description">Комментарий (необязательно):</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Оставьте свой отзыв..."
                className="review-textarea"
              />
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isCreating}
              >
                {isCreating ? "Отправка..." : "Добавить отзыв"}
              </button>
            </div>
          </form>

          <div className="reviews-list">
            <h3>Отзывы:</h3>
            {reviews && reviews.length > 0 ? (
              <div className="reviews-container">
                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="review-author">
                        {(review.userName || review.userSurName) && (
                          <>
                            <strong>
                              {review.userSurName || ""} {review.userName || ""}
                            </strong>
                            <span> · </span>
                          </>
                        )}
                        <div className="review-rating">
                          {"★".repeat(review.rate)}
                          <span className="review-rate-number">
                            {review.rate}/5
                          </span>
                        </div>
                      </div>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.description && (
                      <p className="review-description">{review.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-reviews">Пока нет отзывов</p>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

