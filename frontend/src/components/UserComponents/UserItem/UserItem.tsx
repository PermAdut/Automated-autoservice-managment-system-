import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { ModalWarning } from "../../../widgets/ModalWarning/ModalWarning";
import { EditUserModal } from "../../../widgets/EditUserModal/EditUserModal";
import { useLazyGetUserByIdQuery } from "../../../api/usersApi";
import { UserDetailed } from "../../../api/usersApi";
import updateIcon from "../../../assets/icons/updateIcon.png";
import deleteIcon from "../../../assets/icons/deleteIcon.png";

interface UserItemProps {
  id: string;
  name: string;
  secondName: string;
  onDelete: () => void;
  onUpdate: (userData: Partial<UserDetailed>) => void;
}

export const UserItem: FC<UserItemProps> = ({
  id,
  name,
  secondName,
  onDelete,
  onUpdate,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fetchUser, { data: userData }] = useLazyGetUserByIdQuery();

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteModalOpen(false);
    onDelete();
  };

  const handleUpdateClick = async () => {
    await fetchUser(id);
    setIsEditModalOpen(true);
  };

  const handleEditSave = (
    userData: Partial<UserDetailed> & { roleId?: string }
  ) => {
    onUpdate(userData);
    setIsEditModalOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
  };

  return (
    <>
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all flex justify-between items-center">
        <div className="mb-4 flex-1">
          <h2 className="text-xl font-semibold text-gray-800 m-0">
            <Link
              to={`/user/${id}`}
              className="text-gray-800 no-underline transition-colors hover:text-blue-600"
            >
              {name} {secondName}
            </Link>
          </h2>
          <p className="text-sm text-gray-500 mt-1">Информация пользователя</p>
        </div>
        <div className="flex gap-2.5 ml-4">
          <img
            src={updateIcon}
            alt="Update"
            className="w-6 h-6 cursor-pointer transition-opacity hover:opacity-70"
            onClick={handleUpdateClick}
          />
          <img
            src={deleteIcon}
            alt="Delete"
            className="w-6 h-6 cursor-pointer transition-opacity hover:opacity-70"
            onClick={handleDeleteClick}
          />
        </div>
      </div>
      <ModalWarning
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        message="Вы точно хотите удалить этого пользователя?"
      />
      {userData && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={handleEditCancel}
          onSave={handleEditSave}
          initialData={userData}
        />
      )}
    </>
  );
};
