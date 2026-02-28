import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { UserDetailed, useGetRolesQuery } from "../../api/usersApi";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<UserDetailed> & { roleId?: string }) => void;
  initialData: UserDetailed;
}

export const EditUserModal: FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<UserDetailed>(initialData);
  const { data: roles = [] } = useGetRolesQuery();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, roleId: formData.role?.id });
    onClose();
  };
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value;
    const roleName =
      roles.find((r) => r.id === roleId)?.name || formData.role?.name || "";
    setFormData((prev) => ({
      ...prev,
      role: { id: roleId, name: roleName },
    }));
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl w-full max-w-lg shadow-xl border-2 border-gray-200 max-h-[90vh] overflow-y-auto m-2.5">
        <h3 className="mb-6 text-2xl font-bold text-gray-900 text-center">
          Редактирование пользователя
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Имя:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="px-3 py-2 border border-gray-300 rounded-md text-base transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="surName" className="text-sm font-medium text-gray-700">
              Отчество:
            </label>
            <input
              type="text"
              id="surName"
              name="surName"
              value={formData.surName}
              onChange={handleInputChange}
              required
              className="px-3 py-2 border border-gray-300 rounded-md text-base transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="px-3 py-2 border border-gray-300 rounded-md text-base transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Телефон:
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="px-3 py-2 border border-gray-300 rounded-md text-base transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="role" className="text-sm font-medium text-gray-700">
              Роль:
            </label>
            <select
              id="role"
              value={formData.role?.id ?? ""}
              onChange={handleRoleChange}
              required
              className="px-3 py-2 border border-gray-300 rounded-md text-base transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="" disabled>
                Выберите роль
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded-md text-sm font-medium transition-all bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-gray-400"
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium transition-all bg-primary text-white border border-primary hover:bg-primary-dark hover:border-primary-dark"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
