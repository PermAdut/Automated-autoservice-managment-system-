import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  Supplier,
} from "../../../api/suppliersApi";

const inputBase =
  "w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10";
const inputError =
  "w-full px-4 py-3 border-2 border-red-500 rounded-lg text-base transition-all focus:outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/10";

const supplierSchema = z.object({
  name: z.string().trim().min(2, "Введите название").max(100, "Максимум 100 символов"),
  contact: z.string().trim().min(2, "Введите контакт").max(100, "Максимум 100 символов"),
  address: z.string().trim().min(2, "Введите адрес").max(200, "Максимум 200 символов"),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  supplierId: string | null;
  initialData: Pick<Supplier, "name" | "contact" | "address">;
  onClose: () => void;
}

const SupplierForm = ({ supplierId, initialData, onClose }: SupplierFormProps) => {
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
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto m-2.5">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          {supplierId ? "Редактировать поставщика" : "Добавить поставщика"}
        </h3>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-600">Название *</label>
            <input type="text" {...register("name")} className={errors.name ? inputError : inputBase} placeholder="ООО Ромашка" />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-600">Контакт *</label>
            <input type="text" {...register("contact")} className={errors.contact ? inputError : inputBase} placeholder="Иван Иванов, +7..." />
            {errors.contact && <span className="text-red-500 text-xs">{errors.contact.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-600">Адрес *</label>
            <input type="text" {...register("address")} className={errors.address ? inputError : inputBase} placeholder="г. Минск..." />
            {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <button
              type="button"
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold transition-all hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={onClose}
              disabled={creating || updating}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
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
