import React, { useState } from "react";
import {
  useGetEmployeesQuery,
  useDeleteEmployeeMutation,
} from "../../../api/employeesApi";
import { EmployeeItem } from "../EmployeeItem/EmployeeItem";
import { EmployeeForm } from "../EmployeeForm/EmployeeForm";
import { useDebounce } from "../../../hooks/useDebounce";
import "./EmployeeList.css";

const EMPLOYEE_PER_PAGE = 6;

const EmployeeList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "salary" | "hireDate" | "id">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();
  const debouncedSearch = useDebounce(search, 300);

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
    return <div className="employee-list-loading">Загрузка...</div>;
  if (error)
    return (
      <div className="employee-list-error">
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

  const handleDelete = async (id: number) => {
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

  const handleEdit = (id: number) => {
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
    <div className="employee-list-container">
      <div className="employee-list-header">
        <h1 className="employee-list-title">Список сотрудников</h1>
        <button className="btn-add" onClick={handleAdd}>
          + Добавить сотрудника
        </button>
      </div>
      <div className="employee-list-filters filter-bar">
        <input
          className="filter-input"
          type="text"
          placeholder="Поиск по ID/должности/зарплате"
          value={search}
          onChange={(e) => {
            setCurrentPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
        >
          <option value="name">По должности</option>
          <option value="salary">По зарплате</option>
          <option value="hireDate">По дате найма</option>
          <option value="id">По ID</option>
        </select>
        <select
          className="filter-select"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
        >
          <option value="asc">Возр.</option>
          <option value="desc">Убыв.</option>
        </select>
      </div>
      <div className="employee-list-grid">
        {paginatedEmployees.map((employee) => (
          <div key={employee.id} className="employee-item-wrapper">
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
            />
            <div className="employee-item-actions">
              <button
                className="btn-edit"
                onClick={() => handleEdit(employee.id)}
              >
                Редактировать
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(employee.id)}
              >
                Удалить
              </button>
            </div>
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
        <div className="employee-list-pagination">
          <button
            className="employee-list-button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Назад
          </button>
          <span className="employee-list-page-info">
            {currentPage} / {totalPages}
          </span>
          <button
            className="employee-list-button"
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
