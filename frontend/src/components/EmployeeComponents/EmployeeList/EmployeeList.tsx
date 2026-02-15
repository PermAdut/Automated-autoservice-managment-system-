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

const EMPLOYEE_PER_PAGE = 6;

const EmployeeList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "salary" | "hireDate" | "id">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const debouncedSearch = useDebounce(search, 300);
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.roleName === 'admin' || user?.roleName === 'manager';

  const {
    data: employees = [],
    isLoading,
    error,
    refetch,
  } = useGetEmployeesQuery({
    search: debouncedSearch,
    sortBy,
    sortOrder,
  });

  const [deleteEmployee] = useDeleteEmployeeMutation();

  if (isLoading)
    return <div className="mt-10 text-center text-lg font-semibold text-gray-700 animate-pulse">Загрузка...</div>;
  if (error)
    return (
      <div className="mt-10 text-center text-lg font-semibold text-red-500">
        Ошибка:{" "}
        {error && "status" in error
          ? String(error.status)
          : "Неизвестная ошибка"}
      </div>
    );

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
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Ошибка при удалении сотрудника");
      }
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingId(undefined);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingId(undefined);
  };

  const handleFormSuccess = () => {
    refetch();
  };

  return (
    <div className="p-6 pb-20 max-w-7xl mx-auto relative">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Список сотрудников</h1>
        {isAdmin && (
          <button className="bg-primary text-white border-none px-4 py-2.5 rounded-lg cursor-pointer font-semibold transition-all hover:bg-primary-dark" onClick={handleAdd}>
            + Добавить сотрудника
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          className="px-3 py-2.5 border-2 border-gray-200 rounded-lg min-w-[200px] text-sm transition-all focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none"
          type="text"
          placeholder="Поиск по ID/должности/зарплате"
          value={search}
          onChange={(e) => {
            setCurrentPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          className="px-3 py-2.5 border-2 border-gray-200 rounded-lg min-w-[140px] text-sm transition-all focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
        >
          <option value="name">По должности</option>
          <option value="salary">По зарплате</option>
          <option value="hireDate">По дате найма</option>
          <option value="id">По ID</option>
        </select>
        <select
          className="px-3 py-2.5 border-2 border-gray-200 rounded-lg min-w-[140px] text-sm transition-all focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
        >
          <option value="asc">Возр.</option>
          <option value="desc">Убыв.</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedEmployees.map((employee) => (
          <div key={employee.id} className="border border-gray-200 rounded-xl p-3 shadow-sm flex flex-col gap-2.5">
            <EmployeeItem
              id={employee.id}
              name={(employee as any).name}
              surName={(employee as any).surName}
              lastName={(employee as any).lastName}
              position={employee.position}
              orders={employee.orders}
              schedule={employee.schedule}
              hireDate={employee.hireDate}
              salary={employee.salary}
              showAdminInfo={isAdmin}
            />
            {isAdmin && (
              <div className="flex gap-2.5 justify-end">
                <button
                  className="px-3 py-2 border-none rounded-lg cursor-pointer font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200"
                  onClick={() => handleEdit(employee.id)}
                >
                  Редактировать
                </button>
                <button
                  className="px-3 py-2 border-none rounded-lg cursor-pointer font-semibold bg-red-500 text-white hover:bg-red-600"
                  onClick={() => handleDelete(employee.id)}
                >
                  Удалить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {showForm && (
        <EmployeeForm
          employeeId={editingId}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6 sticky bottom-5 bg-white p-2.5 rounded-md shadow-sm">
          <button
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md bg-white text-primary cursor-pointer transition-all hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Назад
          </button>
          <span className="text-sm font-medium text-gray-700">
            {currentPage} / {totalPages}
          </span>
          <button
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md bg-white text-primary cursor-pointer transition-all hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
