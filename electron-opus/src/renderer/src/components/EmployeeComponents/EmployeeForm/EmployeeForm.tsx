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

const inputBase =
  "w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10";
const inputError =
  "w-full px-4 py-3 border-2 border-red-500 rounded-lg text-base transition-all focus:outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/10";

const employeeSchema = z.object({
  name: z.string().trim().min(1, "Имя обязательно"),
  surName: z.string().trim().min(1, "Фамилия обязательна"),
  lastName: z.string().trim().optional(),
  positionId: z.string().min(1, "Выберите должность"),
  hireDate: z.string().optional(),
  salary: z.number().min(0, "Зарплата должна быть положительной"),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employeeId?: string;
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
      positionId: "",
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
    const payload = {
      ...data,
      hireDate: data.hireDate || undefined,
      salary: String(data.salary),
    };
    try {
      if (employeeId) {
        await updateEmployee({
          id: employeeId,
          data: payload,
        }).unwrap();
      } else {
        await createEmployee(payload).unwrap();
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  if (isLoadingEmployee || isLoadingPositions) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6">
        <div className="bg-white rounded-xl p-6 sm:p-8 text-center text-gray-500 m-2.5">
          Загрузка...
        </div>
      </div>
    );
  }

  if (positionsError) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6">
        <div className="bg-white rounded-xl p-6 sm:p-8 text-center text-red-500 m-2.5">
          Ошибка загрузки должностей.
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6" onClick={onClose}>
      <div
        className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl m-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {employeeId ? "Редактировать сотрудника" : "Добавить сотрудника"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600">Имя *</label>
              <input type="text" {...register("name")} className={errors.name ? inputError : inputBase} placeholder="Иван" />
              {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600">Фамилия *</label>
              <input type="text" {...register("surName")} className={errors.surName ? inputError : inputBase} placeholder="Иванов" />
              {errors.surName && <span className="text-red-500 text-xs">{errors.surName.message}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600">Отчество</label>
              <input type="text" {...register("lastName")} className={inputBase} placeholder="Петрович" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-600">Должность *</label>
            <select {...register("positionId")} className={errors.positionId ? inputError : inputBase}>
              <option value="">Выберите должность</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.positionId && <span className="text-red-500 text-xs">{errors.positionId.message}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600">Дата найма</label>
              <input type="date" {...register("hireDate")} className={inputBase} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600">Зарплата *</label>
              <input type="number" step="0.01" {...register("salary", { valueAsNumber: true })} className={errors.salary ? inputError : inputBase} />
              {errors.salary && <span className="text-red-500 text-xs">{errors.salary.message}</span>}
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold transition-all hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isCreating || isUpdating}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? "Сохранение..." : employeeId ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
