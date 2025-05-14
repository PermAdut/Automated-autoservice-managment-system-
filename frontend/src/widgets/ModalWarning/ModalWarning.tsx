import { FC, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ModalWarning.css';

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
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Подтверждение</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-buttons">
          <button className="modal-button cancel" onClick={onClose}>
            Отмена
          </button>
          <button className="modal-button confirm" onClick={onConfirm}>
            Подтвердить
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
