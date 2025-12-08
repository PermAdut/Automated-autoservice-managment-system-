import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useGetServiceByIdQuery,
} from "../../../../api/servicesApi";
import "./ServiceForm.css";

const serviceSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  price: z.number().min(0, "Цена должна быть положительной"),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  serviceId?: number;
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
    serviceId ?? 0,
    {
      skip: !serviceId,
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
    },
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
        await updateService({
          id: serviceId,
          data,
        }).unwrap();
      } else {
        await createService(data).unwrap();
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Ошибка при сохранении услуги");
    }
  };

  if (isLoadingService) {
    return <div className="service-form-loading">Загрузка...</div>;
  }

  return (
    <div className="service-form-overlay" onClick={onClose}>
      <div
        className="service-form-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="service-form-title">
          {serviceId ? "Редактировать услугу" : "Добавить услугу"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="service-form">
          <div className="form-group">
            <label htmlFor="name">Название *</label>
            <input
              id="name"
              type="text"
              {...register("name")}
              className={errors.name ? "error" : ""}
            />
            {errors.name && (
              <span className="error-message">{errors.name.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea id="description" {...register("description")} rows={4} />
          </div>

          <div className="form-group">
            <label htmlFor="price">Цена *</label>
            <input
              id="price"
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              className={errors.price ? "error" : ""}
            />
            {errors.price && (
              <span className="error-message">{errors.price.message}</span>
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
                : serviceId
                ? "Сохранить"
                : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
