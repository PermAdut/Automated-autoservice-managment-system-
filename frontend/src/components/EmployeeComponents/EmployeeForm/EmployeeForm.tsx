import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useGetEmployeeByIdQuery,
  useGetPositionsQuery,
} from "../../../api/employeesApi";
import "./EmployeeForm.css";

const employeeSchema = z.object({
  name: z.string().trim().min(1, "Имя обязательно"),
  surName: z.string().trim().min(1, "Фамилия обязательна"),
  lastName: z.string().trim().optional(),
  positionId: z.number().min(1, "Выберите должность"),
  hireDate: z.string().optional(),
  salary: z.number().min(0, "Зарплата должна быть положительной"),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employeeId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employeeId,
  onClose,
  onSuccess,
}) => {
  const [createEmployee, { isLoading: isCreating }] =
    useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();

  const { data: employee, isLoading: isLoadingEmployee } =
    useGetEmployeeByIdQuery(employeeId!, {
      skip: !employeeId,
    });
  const {
    data: positions = [],
    isLoading: isLoadingPositions,
    error: positionsError,
  } = useGetPositionsQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      surName: "",
      lastName: "",
      positionId: undefined,
      hireDate: "",
      salary: 0,
    },
  });

  useEffect(() => {
    if (employee) {
      reset({
        name: (employee as any).name ?? "",
        surName: (employee as any).surName ?? "",
        lastName: (employee as any).lastName ?? "",
        positionId: employee.positionId,
        hireDate: employee.hireDate
          ? new Date(employee.hireDate).toISOString().split("T")[0]
          : "",
        salary:
          typeof employee.salary === "string"
            ? parseFloat(employee.salary)
            : employee.salary,
      });
    }
  }, [employee, reset]);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (employeeId) {
        await updateEmployee({
          id: employeeId,
          data: {
            ...data,
            hireDate: data.hireDate || undefined,
          },
        }).unwrap();
      } else {
        await createEmployee({
          ...data,
          hireDate: data.hireDate || undefined,
        }).unwrap();
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving employee:", error);
      alert("Ошибка при сохранении сотрудника");
    }
  };

  if (isLoadingEmployee) {
    return <div className="employee-form-loading">Загрузка...</div>;
  }

  if (isLoadingPositions) {
    return <div className="employee-form-loading">Загрузка должностей...</div>;
  }

  if (positionsError) {
    return (
      <div className="employee-form-loading">
        Ошибка загрузки должностей. Попробуйте позже.
      </div>
    );
  }

  return (
    <div className="employee-form-overlay" onClick={onClose}>
      <div
        className="employee-form-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="employee-form-title">
          {employeeId ? "Редактировать сотрудника" : "Добавить сотрудника"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="employee-form">
          <div className="form-row">
            <label>
              Имя *
              <input
                type="text"
                {...register("name")}
                className={errors.name ? "error" : ""}
                placeholder="Иван"
              />
              {errors.name && (
                <span className="error-message">{errors.name.message}</span>
              )}
            </label>
            <label>
              Фамилия *
              <input
                type="text"
                {...register("surName")}
                className={errors.surName ? "error" : ""}
                placeholder="Иванов"
              />
              {errors.surName && (
                <span className="error-message">{errors.surName.message}</span>
              )}
            </label>
            <label>
              Отчество
              <input
                type="text"
                {...register("lastName")}
                placeholder="Петрович"
              />
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="positionId">Должность *</label>
            <select
              id="positionId"
              {...register("positionId", { valueAsNumber: true })}
              className={errors.positionId ? "error" : ""}
            >
              <option value="">Выберите должность</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.positionId && (
              <span className="error-message">{errors.positionId.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="hireDate">Дата найма</label>
            <input id="hireDate" type="date" {...register("hireDate")} />
          </div>

          <div className="form-group">
            <label htmlFor="salary">Зарплата *</label>
            <input
              id="salary"
              type="number"
              step="0.01"
              {...register("salary", { valueAsNumber: true })}
              className={errors.salary ? "error" : ""}
            />
            {errors.salary && (
              <span className="error-message">{errors.salary.message}</span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={isCreating || isUpdating}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating
                ? "Сохранение..."
                : employeeId
                ? "Сохранить"
                : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
