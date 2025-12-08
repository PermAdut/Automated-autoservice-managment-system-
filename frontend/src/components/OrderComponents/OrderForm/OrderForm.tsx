import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Order } from "../../../api/ordersApi";
import { useGetUsersQuery, useGetUserByIdQuery } from "../../../api/usersApi";
import { useGetEmployeesQuery } from "../../../api/employeesApi";
import { useGetServicesQuery } from "../../../api/servicesApi";
import { useGetSparePartsQuery } from "../../../api/sparePartsApi";
import "./OrderForm.css";

const serviceItemSchema = z.object({
  serviceId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

const sparePartItemSchema = z.object({
  sparePartId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

const orderSchema = z.object({
  userId: z.number().int().positive(),
  carId: z.number().int().positive(),
  employeeId: z.number().int().positive(),
  status: z.string().trim().optional(),
  services: z.array(serviceItemSchema).optional(),
  spareParts: z.array(sparePartItemSchema).optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  order: Order | null;
  onClose: () => void;
  onSubmit: (payload: OrderFormValues, id?: number) => Promise<void>;
}

const OrderForm = ({ order, onClose, onSubmit }: OrderFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      userId: order?.userId ?? undefined,
      carId: order?.carId ?? undefined,
      employeeId: order?.employeeId ?? undefined,
      status: order?.status ?? "",
      services:
        order?.services?.map((s) => ({
          serviceId: s.id,
          quantity: 1,
        })) ?? [],
      spareParts:
        order?.sparePart?.map((p) => ({
          sparePartId: p.id,
          quantity: 1,
        })) ?? [],
    },
  });

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({ control, name: "services" });
  const {
    fields: spareFields,
    append: appendSpare,
    remove: removeSpare,
  } = useFieldArray({ control, name: "spareParts" });

  const { data: services = [] } = useGetServicesQuery({
    sortBy: "name",
    sortOrder: "asc",
  });
  const { data: spareParts = [] } = useGetSparePartsQuery({
    sortBy: "name",
    sortOrder: "asc",
  });
  const { data: users = [] } = useGetUsersQuery({
    sortBy: "name",
    sortOrder: "asc",
  });
  const filteredUsers = users.filter(
    (u: any) =>
      (u as any).role === "customer" || (u as any).role?.name === "customer"
  );

  const selectedUserId = watch("userId");
  const { data: selectedUser } = useGetUserByIdQuery(selectedUserId!, {
    skip: !selectedUserId,
  });
  const { data: employees = [] } = useGetEmployeesQuery({
    sortBy: "name",
    sortOrder: "asc",
  });

  useEffect(() => {
    reset({
      userId: order?.userId ?? undefined,
      carId: order?.carId ?? undefined,
      employeeId: order?.employeeId ?? undefined,
      status: order?.status ?? "",
      services:
        order?.services?.map((s) => ({
          serviceId: s.id,
          quantity: 1,
        })) ?? [],
      spareParts:
        order?.sparePart?.map((p) => ({
          sparePartId: p.id,
          quantity: 1,
        })) ?? [],
    });
  }, [order, reset]);

  useEffect(() => {
    if (selectedUser?.cars?.length) {
      setValue("carId", selectedUser.cars[0].id);
    } else {
      setValue("carId", undefined as unknown as number);
    }
  }, [selectedUser, setValue]);

  const onSubmitForm = async (values: OrderFormValues) => {
    await onSubmit(values, order?.id);
  };

  return (
    <div className="order-form-overlay">
      <div className="order-form-modal">
        <h3 className="order-form-title">
          {order ? "Редактировать заказ" : "Добавить заказ"}
        </h3>
        <form className="order-form" onSubmit={handleSubmit(onSubmitForm)}>
          <div className="form-row">
            <label>
              Пользователь *
              <select {...register("userId", { valueAsNumber: true })}>
                <option value="">Выберите пользователя</option>
                {filteredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.surName} (id: {u.id})
                  </option>
                ))}
              </select>
              {errors.userId && (
                <span className="error-message">{errors.userId.message}</span>
              )}
            </label>
            <label>
              Авто *
              <select {...register("carId", { valueAsNumber: true })}>
                <option value="">Выберите авто</option>
                {selectedUser?.cars?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (VIN: {c.vin})
                  </option>
                ))}
              </select>
              {errors.carId && (
                <span className="error-message">{errors.carId.message}</span>
              )}
            </label>
            <label>
              Сотрудник *
              <select {...register("employeeId", { valueAsNumber: true })}>
                <option value="">Выберите сотрудника</option>
                {Array.isArray(employees)
                  ? employees.map((e: any) => (
                      <option key={e.id} value={e.id}>
                        {e.name} (id: {e.id})
                      </option>
                    ))
                  : null}
              </select>
              {errors.employeeId && (
                <span className="error-message">
                  {errors.employeeId.message}
                </span>
              )}
            </label>
          </div>

          <label>
            Статус
            <select {...register("status")}>
              <option value="">Не задан</option>
              <option value="pending">pending</option>
              <option value="in_progress">in_progress</option>
              <option value="completed">completed</option>
            </select>
          </label>

          <div className="section">
            <div className="section-header">
              <span>Услуги</span>
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  appendService({
                    serviceId: services[0]?.id ?? 0,
                    quantity: 1,
                  })
                }
              >
                + Добавить услугу
              </button>
            </div>
            {serviceFields.length === 0 && (
              <p className="muted">Не выбрано ни одной услуги</p>
            )}
            {serviceFields.map((field, index) => (
              <div className="inline-row" key={field.id}>
                <select
                  {...register(`services.${index}.serviceId` as const, {
                    valueAsNumber: true,
                  })}
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  {...register(`services.${index}.quantity` as const, {
                    valueAsNumber: true,
                  })}
                />
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => removeService(index)}
                >
                  Удалить
                </button>
              </div>
            ))}
            {errors.services && (
              <span className="error-message">Проверьте услуги</span>
            )}
          </div>

          <div className="section">
            <div className="section-header">
              <span>Запчасти</span>
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  appendSpare({
                    sparePartId: spareParts[0]?.sparePart?.id ?? 0,
                    quantity: 1,
                  })
                }
              >
                + Добавить запчасть
              </button>
            </div>
            {spareFields.length === 0 && (
              <p className="muted">Не выбрана ни одна запчасть</p>
            )}
            {spareFields.map((field, index) => (
              <div className="inline-row" key={field.id}>
                <select
                  {...register(`spareParts.${index}.sparePartId` as const, {
                    valueAsNumber: true,
                  })}
                >
                  {spareParts.map((sp) => (
                    <option key={sp.sparePart.id} value={sp.sparePart.id}>
                      {sp.sparePart.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  {...register(`spareParts.${index}.quantity` as const, {
                    valueAsNumber: true,
                  })}
                />
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => removeSpare(index)}
                >
                  Удалить
                </button>
              </div>
            ))}
            {errors.spareParts && (
              <span className="error-message">Проверьте запчасти</span>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn-save">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
