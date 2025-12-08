import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  Supplier,
} from "../../../api/suppliersApi";
import "./SupplierForm.css";

const supplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Введите название")
    .max(100, "Максимум 100 символов"),
  contact: z
    .string()
    .trim()
    .min(2, "Введите контакт")
    .max(100, "Максимум 100 символов"),
  address: z
    .string()
    .trim()
    .min(2, "Введите адрес")
    .max(200, "Максимум 200 символов"),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  supplierId: number | null;
  initialData: Pick<Supplier, "name" | "contact" | "address">;
  onClose: () => void;
}

const SupplierForm = ({
  supplierId,
  initialData,
  onClose,
}: SupplierFormProps) => {
  const [createSupplier, { isLoading: creating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: updating }] = useUpdateSupplierMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = async (values: SupplierFormValues) => {
    try {
      if (supplierId) {
        await updateSupplier({ id: supplierId, data: values }).unwrap();
      } else {
        await createSupplier(values).unwrap();
      }
      onClose();
    } catch (err) {
      console.error("Failed to submit supplier form", err);
      alert("Не удалось сохранить поставщика");
    }
  };

  return (
    <div className="supplier-form-overlay">
      <div className="supplier-form-modal">
        <h3 className="supplier-form-title">
          {supplierId ? "Редактировать поставщика" : "Добавить поставщика"}
        </h3>
        <form className="supplier-form" onSubmit={handleSubmit(onSubmit)}>
          <label>
            Название *
            <input
              type="text"
              {...register("name")}
              className={errors.name ? "error" : ""}
              placeholder="ООО Ромашка"
            />
            {errors.name && (
              <span className="error-message">{errors.name.message}</span>
            )}
          </label>
          <label>
            Контактное лицо / телефон
            <input
              type="text"
              {...register("contact")}
              placeholder="Иван Иванов, +7..."
            />
          </label>
          <label>
            Адрес
            <input
              type="text"
              {...register("address")}
              placeholder="г. Минск..."
            />
          </label>

          <div className="supplier-form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={creating || updating}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={creating || updating}
            >
              {creating || updating ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierForm;
