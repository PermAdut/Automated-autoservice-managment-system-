import React, { useState, useEffect } from "react";
import {
  useCreateReviewMutation,
  useGetEmployeeReviewsQuery,
} from "../../../api/employeesApi";

interface ReviewModalProps {
  employeeId: string;
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
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl m-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Отзывы о рабочем {employeeName}
          </h2>
          <button
            className="bg-transparent border-none text-3xl cursor-pointer text-gray-500 w-[30px] h-[30px] flex items-center justify-center hover:text-black"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="mb-5">
              <label
                htmlFor="rate"
                className="block mb-2 font-semibold text-gray-800"
              >
                Оценка:
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`bg-transparent border-none text-[32px] cursor-pointer p-0 transition-colors ${
                      rate >= value ? "text-yellow-400" : "text-gray-300"
                    } hover:text-yellow-400`}
                    onClick={() => setRate(value)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <label
                htmlFor="description"
                className="block mb-2 font-semibold text-gray-800"
              >
                Комментарий (необязательно):
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Оставьте свой отзыв..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm font-[inherit] resize-y focus:outline-none focus:border-primary"
              />
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="px-5 py-2.5 border-none rounded-lg cursor-pointer text-base font-semibold transition-colors bg-gradient-to-br from-primary to-primary-dark text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isCreating}
              >
                {isCreating ? "Отправка..." : "Добавить отзыв"}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="mb-4 text-gray-800 font-semibold">Отзывы:</h3>
            {reviews && reviews.length > 0 ? (
              <div className="flex flex-col gap-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-50 p-4 rounded border-l-3 border-l-primary"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {(review.userName || review.userSurName) && (
                          <>
                            <strong className="text-gray-800 text-sm">
                              {review.userSurName || ""} {review.userName || ""}
                            </strong>
                            <span> · </span>
                          </>
                        )}
                        <div className="flex items-center gap-1 text-yellow-400 text-lg">
                          {"★".repeat(review.rate)}
                          <span className="text-gray-500 text-sm ml-1">
                            {review.rate}/5
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.description && (
                      <p className="m-0 text-gray-600 leading-relaxed">
                        {review.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-center py-5">
                Пока нет отзывов
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2.5 p-6 border-t border-gray-200">
          <button
            className="px-5 py-2.5 border-none rounded-lg cursor-pointer text-base font-semibold transition-colors bg-gray-400 text-white hover:bg-gray-500"
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
