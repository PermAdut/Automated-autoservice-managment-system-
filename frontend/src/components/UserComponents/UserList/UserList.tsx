import { useState } from "react";
import { Link } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../../../api/usersApi";
import { UserDetailed } from "../../../api/usersApi";
import { DataTable } from "../../ui/data-table";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { ModalWarning } from "../../../widgets/ModalWarning/ModalWarning";
import { EditUserModal } from "../../../widgets/EditUserModal/EditUserModal";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useLazyGetUserByIdQuery } from "../../../api/usersApi";

type UserRow = {
  id: string;
  name: string;
  surName: string;
  roleName?: string;
  email?: string;
};

const roleColors: Record<string, "info" | "success" | "warning" | "secondary"> = {
  admin: "warning",
  manager: "info",
  client: "success",
  mechanic: "secondary",
};

const roleLabels: Record<string, string> = {
  admin: "Администратор",
  manager: "Менеджер",
  client: "Клиент",
  mechanic: "Механик",
};

function UserRowActions({ row }: { row: UserRow }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [fetchUser, { data: userData }] = useLazyGetUserByIdQuery();

  const handleEditClick = async () => {
    await fetchUser(row.id);
    setIsEditOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link to={`/user/${row.id}`}>
            <EyeOutlined />
          </Link>
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={handleEditClick}>
          <EditOutlined />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => setIsDeleteOpen(true)}
        >
          <DeleteOutlined />
        </Button>
      </div>

      <ModalWarning
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          setIsDeleteOpen(false);
          try {
            await deleteUser(row.id).unwrap();
          } catch (err) {
            console.error("Failed to delete user:", err);
          }
        }}
        message="Вы точно хотите удалить этого пользователя?"
      />
      {userData && (
        <EditUserModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={async (data) => {
            try {
              const { role, ...rest } = data as any;
              await updateUser({
                id: row.id,
                data: { ...rest, roleId: (role as any)?.id ?? (data as any)?.roleId },
              }).unwrap();
            } catch (err) {
              console.error("Failed to update user:", err);
            }
            setIsEditOpen(false);
          }}
          initialData={userData}
        />
      )}
    </>
  );
}

const columns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "name",
    header: "Имя",
    cell: ({ row }) => (
      <Link
        to={`/user/${row.original.id}`}
        className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
      >
        {row.original.surName} {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ getValue }) => (
      <span className="text-gray-500 text-sm">{(getValue() as string) || "—"}</span>
    ),
  },
  {
    accessorKey: "roleName",
    header: "Роль",
    cell: ({ getValue }) => {
      const role = (getValue() as string) ?? "";
      return (
        <Badge variant={roleColors[role] ?? "secondary"}>
          {roleLabels[role] ?? role}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => <UserRowActions row={row.original} />,
  },
];

const UserList = () => {
  const { data: users = [], isLoading, error } = useGetUsersQuery({
    search: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-3">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-10 text-red-500 font-medium">
          Ошибка загрузки данных
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-20 max-w-7xl mx-auto">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          <UserOutlined className="text-base" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
        <span className="ml-auto text-sm text-gray-400 font-medium">{users.length} записей</span>
      </div>

      <DataTable
        columns={columns}
        data={users as UserRow[]}
        searchPlaceholder="Поиск по имени, email..."
        pageSize={10}
      />
    </div>
  );
};

export default UserList;
