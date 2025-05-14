import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ModalWarning } from "../../../widgets/ModalWarning/ModalWarning";
import { EditUserModal } from "../../../widgets/EditUserModal/EditUserModal";
import { UserDetailed, fetchUsersById } from "../../../store/slices/userSlice";
import { RootState, AppDispatch } from "../../../store/index";
import updateIcon from '../../../assets/icons/updateIcon.png';
import deleteIcon from '../../../assets/icons/deleteIcon.png';
import './UserItem.css';

interface UserItemProps {
  id: number;
  name: string;
  secondName: string;
  onDelete: (id: number) => void;
  onUpdate: (userData: UserDetailed) => void;
}

export const UserItem: FC<UserItemProps> = ({
  id,
  name,
  secondName,
  onDelete,
  onUpdate,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const userData = useSelector((state: RootState) => state.user.detailedUser);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    console.log(`Deleting user with id: ${id}`);
    setIsDeleteModalOpen(false);
    onDelete(id);
  };

  const handleUpdateClick = async () => {
    await dispatch(fetchUsersById(id));
    console.log(isEditModalOpen);
    setIsEditModalOpen(true);
  };

  const handleEditSave = (userData: UserDetailed) => {
    console.log('Saving user data:', userData);
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
