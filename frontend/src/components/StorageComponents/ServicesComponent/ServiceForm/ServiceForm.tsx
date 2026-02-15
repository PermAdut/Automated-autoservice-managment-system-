import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useGetServiceByIdQuery,
} from "../../../../api/servicesApi";

const inputBase =
  "w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10";
const inputError =
  "w-full px-4 py-3 border-2 border-red-500 rounded-lg text-base transition-all focus:outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/10";

const serviceSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  price: z.number().min(0, "Цена должна быть положительной"),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  serviceId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  serviceId,
  onClose,
  onSuccess,
}) => {
  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();

  const { data: service, isLoading: isLoadingService } = useGetServiceByIdQuery(
    serviceId!,
    { skip: !serviceId }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: "", description: "", price: 0 },
  });

  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        description: service.description || "",
        price:
          typeof service.price === "string"
            ? parseFloat(service.price)
            : service.price,
      });
    }
  }, [service, reset]);

  const onSubmit = async (data: ServiceFormData) => {
    try {
      if (serviceId) {
        await updateService({ id: serviceId, data }).unwrap();
      } else {
        await createService(data).unwrap();
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  if (isLoadingService) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {serviceId ? "Редактировать услугу" : "Добавить услугу"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-600">Название *</label>
            <input type="text" {...register("name")} className={errors.name ? inputError : inputBase} />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-600">Описание</label>
            <textarea
              {...register("description")}
              rows={4}
              className={`${inputBase} resize-y`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-600">Цена (руб.) *</label>
            <input
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              className={errors.price ? inputError : inputBase}
            />
            {errors.price && <span className="text-red-500 text-xs">{errors.price.message}</span>}
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
              {isCreating || isUpdating ? "Сохранение..." : serviceId ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
