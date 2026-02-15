import { FC, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalWarningProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

export const ModalWarning: FC<ModalWarningProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-hidden">
      <div className="bg-white p-8 rounded-2xl w-[90%] max-w-[480px] shadow-xl border-2 border-gray-200">
        <h3 className="mb-6 text-2xl font-bold text-gray-900 text-center">
          Подтверждение
        </h3>
        <p className="mb-8 text-lg text-gray-700 leading-relaxed text-center">
          {message}
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="px-6 py-3 rounded-lg text-base font-semibold transition-all min-w-[120px] bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            className="px-6 py-3 rounded-lg text-base font-semibold transition-all min-w-[120px] bg-red-600 text-white border-2 border-red-600 hover:bg-red-700 hover:border-red-700 hover:scale-105"
            onClick={onConfirm}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
