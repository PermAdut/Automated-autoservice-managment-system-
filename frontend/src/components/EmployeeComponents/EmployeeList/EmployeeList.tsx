import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { fetchEmployees } from "../../../store/slices/employeeSlice";
import { EmployeeItem } from "../EmployeeItem/EmployeeItem";
import "./EmployeeList.css";

const EMPLOYEE_PER_PAGE = 6;

const EmployeeList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { employees, isLoading, error } = useAppSelector(
    (state) => state.employee
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  if (isLoading) return <div className="employee-list-loading">Загрузка...</div>;
  if (error) return <div className="employee-list-error">Ошибка: {error}</div>;

  const totalPages = Math.ceil(employees.length / EMPLOYEE_PER_PAGE);
  const paginatedEmployees = employees.slice(
    (currentPage - 1) * EMPLOYEE_PER_PAGE,
    currentPage * EMPLOYEE_PER_PAGE
  );

  return (
    <div className="employee-list-container">
      <h1 className="employee-list-title">Список сотрудников</h1>
      <div className="employee-list-grid">
        {paginatedEmployees.map((employee) => (
          <EmployeeItem
            key={employee.id}
            id={employee.id}
            position={employee.position}
            orders={employee.orders}
            schedule={employee.schedule}
            hireDate={employee.hireDate}
            salary={employee.salary}
          />
        ))}
      </div>

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