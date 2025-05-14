import { FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { UserDetailed } from '../../store/slices/userSlice';
import './EditUserModal.css';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserDetailed) => void;
  initialData: UserDetailed;
}

export const EditUserModal: FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<UserDetailed>(initialData);

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

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="edit-modal-overlay">
      <div className="edit-modal-content">
        <h3 className="edit-modal-title">Редактирование пользователя</h3>
        <form onSubmit={handleSubmit} className="edit-modal-form">
          <div className="form-group">
            <label htmlFor="name">Имя:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="surName">Отчество:</label>
            <input
              type="text"
              id="surName"
              name="surName"
              value={formData.surName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Телефон:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="login">Логин:</label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="edit-modal-buttons">
            <button type="button" className="edit-modal-button cancel" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="edit-modal-button save">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}; 