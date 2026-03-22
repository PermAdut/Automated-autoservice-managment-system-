import React, { useState } from "react";
import {
  useGetEmployeesQuery,
  useDeleteEmployeeMutation,
} from "../../../api/employeesApi";
import { EmployeeItem } from "../EmployeeItem/EmployeeItem";
import { EmployeeForm } from "../EmployeeForm/EmployeeForm";
import { useDebounce } from "../../../hooks/useDebounce";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Select } from "../../ui/select";
import {
  PlusOutlined,
  TeamOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { PageLayout } from "../../layout/PageLayout";

const EMPLOYEE_PER_PAGE = 6;

const EmployeeList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "salary" | "hireDate" | "id">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const debouncedSearch = useDebounce(search, 300);
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.roleName === "admin" || user?.roleName === "manager";

  const {
    data: employees = [],
    isLoading,
    error,
    refetch,
  } = useGetEmployeesQuery({ search: debouncedSearch, sortBy, sortOrder });

  const [deleteEmployee] = useDeleteEmployeeMutation();

  const safeEmployees = Array.isArray(employees) ? employees : [];
  const totalPages = Math.ceil(safeEmployees.length / EMPLOYEE_PER_PAGE);
  const paginatedEmployees = safeEmployees.slice(
    (currentPage - 1) * EMPLOYEE_PER_PAGE,
    currentPage * EMPLOYEE_PER_PAGE
  );

  const handleDelete = async (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этого сотрудника?")) {
      try {
        await deleteEmployee(id).unwrap();
        refetch();
      } catch {
        console.error("Error deleting employee");
      }
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="text-center py-10 text-red-500 font-medium">
          Ошибка загрузки данных
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="pb-20 flex flex-col">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
          <TeamOutlined className="text-base" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Сотрудники</h1>
        <span className="ml-auto text-sm text-gray-400 font-medium">{safeEmployees.length} чел.</span>
        {isAdmin && (
          <Button
            onClick={() => {
              setEditingId(undefined);
              setShowForm(true);
            }}
          >
            <PlusOutlined className="mr-1.5" />
            Добавить
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Input
          placeholder="Поиск по должности..."
          value={search}
          onChange={(e) => {
            setCurrentPage(1);
            setSearch(e.target.value);
          }}
          className="max-w-xs"
        />
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="w-40"
        >
          <option value="name">По должности</option>
          <option value="salary">По зарплате</option>
          <option value="hireDate">По дате найма</option>
          <option value="id">По ID</option>
        </Select>
        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
          className="w-32"
        >
          <option value="asc">По возр.</option>
          <option value="desc">По убыв.</option>
        </Select>
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto">
      {paginatedEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedEmployees.map((employee) => (
            <div key={employee.id} className="flex flex-col gap-2 min-w-0">
              <EmployeeItem
                id={employee.id}
                name={(employee as any).name}
                surName={(employee as any).surName}
                lastName={(employee as any).lastName}
                position={employee.position ?? { id: "", name: "", description: "" }}
                orders={employee.orders}
                schedule={employee.schedule}
                hireDate={employee.hireDate}
                salary={typeof employee.salary === "string" ? parseFloat(employee.salary) || 0 : employee.salary}
                showAdminInfo={isAdmin}
              />
              {isAdmin && (
                <div className="flex gap-2 justify-end px-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(employee.id);
                      setShowForm(true);
                    }}
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(employee.id)}
                  >
                    Удалить
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <TeamOutlined className="text-4xl mb-3 block" />
          Сотрудников нет
        </div>
      )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-1">
          <p className="text-sm text-gray-500">
            Страница <span className="font-medium text-gray-700">{currentPage}</span> из{" "}
            <span className="font-medium text-gray-700">{totalPages}</span>
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <LeftOutlined />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <RightOutlined />
            </Button>
          </div>
        </div>
      )}

      {showForm && (
        <EmployeeForm
          employeeId={editingId}
          onClose={() => {
            setShowForm(false);
            setEditingId(undefined);
          }}
          onSuccess={() => refetch()}
        />
      )}
    </PageLayout>
  );
};

export default EmployeeList;
