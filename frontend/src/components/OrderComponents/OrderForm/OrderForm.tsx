import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Order } from "../../../api/ordersApi";
import { useGetUserByIdQuery } from "../../../api/usersApi";
import { useGetEmployeesQuery } from "../../../api/employeesApi";
import { useGetServicesQuery } from "../../../api/servicesApi";
import { useGetSparePartsQuery } from "../../../api/sparePartsApi";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

const inputBase =
  "w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10";

const serviceItemSchema = z.object({
  serviceId: z.string().min(1, "Выберите услугу"),
  quantity: z.number().int().positive(),
});

const sparePartItemSchema = z.object({
  sparePartId: z.string().min(1, "Выберите запчасть"),
  quantity: z.number().int().positive(),
});

const orderSchema = z.object({
  carId: z.string().min(1, "Выберите автомобиль"),
  employeeId: z.string().min(1, "Выберите сотрудника"),
  services: z.array(serviceItemSchema).min(1, { message: "Добавьте хотя бы одну услугу" }),
  spareParts: z.array(sparePartItemSchema).optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  order: Order | null;
  onClose: () => void;
  onSubmit: (payload: OrderFormValues & { userId: string }, id?: string) => Promise<void>;
}

const OrderForm = ({ order, onClose, onSubmit }: OrderFormProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const currentUserId = user?.id;

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
      carId: order?.carId ?? "",
      employeeId: order?.employeeId ?? "",
      services: order?.services?.map((s) => ({ serviceId: s.id, quantity: 1 })) ?? [],
      spareParts: order?.sparePart?.map((p) => ({ sparePartId: p.id, quantity: 1 })) ?? [],
    },
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({ control, name: "services" });
  const { fields: spareFields, append: appendSpare, remove: removeSpare } = useFieldArray({ control, name: "spareParts" });

  const { data: services = [] } = useGetServicesQuery({ sortBy: "name", sortOrder: "asc" });
  const { data: spareParts = [] } = useGetSparePartsQuery({ sortBy: "name", sortOrder: "asc" });

  const selectedUserId = order?.userId ?? currentUserId;
  const { data: selectedUser } = useGetUserByIdQuery(selectedUserId!, {
    skip: !selectedUserId || !currentUserId,
  });

  useEffect(() => {
    if (!order && selectedUser?.cars?.length && !watch("carId")) {
      setValue("carId", selectedUser.cars[0].id);
    }
  }, [selectedUser, order, setValue, watch]);

  const { data: employees = [] } = useGetEmployeesQuery({ sortBy: "name", sortOrder: "asc" });

  useEffect(() => {
    reset({
      carId: order?.carId ?? "",
      employeeId: order?.employeeId ?? "",
      services: order?.services?.map((s) => ({ serviceId: s.id, quantity: 1 })) ?? [],
      spareParts: order?.sparePart?.map((p) => ({ sparePartId: p.id, quantity: 1 })) ?? [],
    });
  }, [order, reset]);

  useEffect(() => {
    if (!order && selectedUser?.cars?.length && !watch("carId")) {
      setValue("carId", selectedUser.cars[0].id);
    }
  }, [selectedUser, order, setValue, watch]);

  useEffect(() => {
    if (!order && serviceFields.length === 0 && services.length > 0) {
      appendService({ serviceId: services[0].id, quantity: 1 });
    }
  }, [order, serviceFields.length, services, appendService]);

  const onSubmitForm = async (values: OrderFormValues) => {
    const payload = { ...values, userId: currentUserId! } as OrderFormValues & { userId: string };
    await onSubmit(payload, order?.id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          {order ? "Редактировать заказ" : "Новый заказ"}
        </h3>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmitForm)}>
          {order && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600">Пользователь</label>
              <input
                type="text"
                value={`${selectedUser?.name || ""} ${selectedUser?.surName || ""}`}
                disabled
                className={`${inputBase} bg-gray-100 text-gray-500 cursor-not-allowed`}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600">Автомобиль *</label>
              <select {...register("carId")} className={inputBase}>
                <option value="">Выберите авто</option>
                {selectedUser?.cars?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.brand} {c.model} (VIN: {c.vin})</option>
                ))}
              </select>
              {errors.carId && <span className="text-red-500 text-xs">{errors.carId.message}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600">Сотрудник *</label>
              <select {...register("employeeId")} className={inputBase}>
                <option value="">Выберите сотрудника</option>
                {Array.isArray(employees) &&
                  employees.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
              </select>
              {errors.employeeId && <span className="text-red-500 text-xs">{errors.employeeId.message}</span>}
            </div>
          </div>

          {/* Услуги */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-gray-700">Услуги</span>
              <button
                type="button"
                className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
                onClick={() => appendService({ serviceId: services[0]?.id ?? "", quantity: 1 })}
              >
                + Добавить
              </button>
            </div>
            {serviceFields.length === 0 && (
              <p className="text-gray-400 text-sm italic">Не выбрано ни одной услуги</p>
            )}
            <div className="flex flex-col gap-2">
              {serviceFields.map((field, index) => (
                <div className="flex items-center gap-2" key={field.id}>
                  <select {...register(`services.${index}.serviceId` as const)} className={`${inputBase} flex-1`}>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    {...register(`services.${index}.quantity` as const, { valueAsNumber: true })}
                    className={`${inputBase} w-20`}
                  />
                  <button
                    type="button"
                    className="px-3 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                    onClick={() => removeService(index)}
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
            {errors.services && <span className="text-red-500 text-xs mt-1">Проверьте услуги</span>}
          </div>

          {/* Запчасти */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-gray-700">Запчасти</span>
              <button
                type="button"
                className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
                onClick={() => appendSpare({ sparePartId: spareParts[0]?.sparePart?.id ?? "", quantity: 1 })}
              >
                + Добавить
              </button>
            </div>
            {spareFields.length === 0 && (
              <p className="text-gray-400 text-sm italic">Не выбрана ни одна запчасть</p>
            )}
            <div className="flex flex-col gap-2">
              {spareFields.map((field, index) => (
                <div className="flex items-center gap-2" key={field.id}>
                  <select {...register(`spareParts.${index}.sparePartId` as const)} className={`${inputBase} flex-1`}>
                    {spareParts.map((sp) => (
                      <option key={sp.sparePart.id} value={sp.sparePart.id}>{sp.sparePart.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    {...register(`spareParts.${index}.quantity` as const, { valueAsNumber: true })}
                    className={`${inputBase} w-20`}
                  />
                  <button
                    type="button"
                    className="px-3 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                    onClick={() => removeSpare(index)}
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
            {errors.spareParts && <span className="text-red-500 text-xs mt-1">Проверьте запчасти</span>}
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <button type="button" className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold transition-all hover:bg-gray-600" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="px-6 py-3 bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
