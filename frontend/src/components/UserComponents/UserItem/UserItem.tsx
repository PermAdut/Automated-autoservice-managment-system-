import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { ModalWarning } from "../../../widgets/ModalWarning/ModalWarning";
import { EditUserModal } from "../../../widgets/EditUserModal/EditUserModal";
import { useLazyGetUserByIdQuery } from "../../../api/usersApi";
import { UserDetailed } from "../../../api/usersApi";
import updateIcon from "../../../assets/icons/updateIcon.png";
import deleteIcon from "../../../assets/icons/deleteIcon.png";
import "./UserItem.css";

interface UserItemProps {
  id: number;
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
    userData: Partial<UserDetailed> & { roleId?: number }
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
      <div className="useritem-card">
        <div className="useritem-header">
          <h2 className="useritem-name">
            <Link to={`/user/${id}`} className="useritem-link">
              {name} {secondName}
            </Link>
          </h2>
          <p className="useritem-info">Информация пользователя</p>
        </div>
        <div className="useritem-actions">
          <img
            src={updateIcon}
            alt="Update"
            className="useritem-icon"
            onClick={handleUpdateClick}
          />
          <img
            src={deleteIcon}
            alt="Delete"
            className="useritem-icon"
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
