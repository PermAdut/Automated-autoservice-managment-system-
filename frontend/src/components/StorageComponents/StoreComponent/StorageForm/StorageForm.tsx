import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SparePartStock,
  SpareStockPayload,
  useGetSparePartsQuery,
  useGetStoresMetaQuery,
  useGetCategoriesMetaQuery,
} from "../../../../api/sparePartsApi";

const inputBase =
  "w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10";
const inputError =
  "w-full px-4 py-3 border-2 border-red-500 rounded-lg text-base transition-all focus:outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/10";

const stockSchema = z.object({
  sparePartId: z.string().min(1, "Укажите запчасть"),
  storeId: z.string().min(1, "Выберите склад"),
  price: z.number().nonnegative("Цена не может быть отрицательной"),
  quantity: z.number().int().nonnegative("Количество не может быть отрицательным"),
  categoryId: z.string().min(1, "Выберите категорию"),
});

type StockFormValues = z.infer<typeof stockSchema>;

interface StorageFormProps {
  stock: SparePartStock | null;
  onClose: () => void;
  onSubmit: (payload: SpareStockPayload, sparePartId?: string) => Promise<void>;
}

const StorageForm = ({ stock, onClose, onSubmit }: StorageFormProps) => {
  const { data: sparePartsList = [] } = useGetSparePartsQuery({ sortBy: "name", sortOrder: "asc" });
  const { data: stores = [] } = useGetStoresMetaQuery();
  const { data: categories = [] } = useGetCategoriesMetaQuery();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StockFormValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      sparePartId: stock?.sparePart?.id ?? "",
      storeId: (stock as any)?.store_id ?? (stock as any)?.storeId ?? "",
      price:
        typeof stock?.sparePart?.price === "string"
          ? parseFloat(stock?.sparePart?.price)
          : (stock?.sparePart?.price as number | undefined),
      quantity: stock?.quantity,
      categoryId: stock?.sparePart?.category?.id ?? "",
    },
  });

  useEffect(() => {
    reset({
      sparePartId: stock?.sparePart?.id ?? "",
      storeId: (stock as any)?.store_id ?? (stock as any)?.storeId ?? "",
      price:
        typeof stock?.sparePart?.price === "string"
          ? parseFloat(stock?.sparePart?.price)
          : (stock?.sparePart?.price as number | undefined),
      quantity: stock?.quantity,
      categoryId: stock?.sparePart?.category?.id ?? "",
    });
  }, [stock, reset]);

  const onSubmitForm = async (values: StockFormValues) => {
    const payload: SpareStockPayload = {
      sparePartId: values.sparePartId,
      storeId: values.storeId,
      quantity: values.quantity,
    };
    await onSubmit(payload, stock?.sparePart?.id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl m-2.5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          {stock ? "Редактировать запчасть на складе" : "Добавить запчасть на склад"}
        </h3>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmitForm)}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-600">Запчасть *</label>
            <select {...register("sparePartId")} className={errors.sparePartId ? inputError : inputBase}>
              <option value="">Выберите запчасть</option>
              {sparePartsList.map((sp) => (
                <option key={sp.sparePart.id} value={sp.sparePart.id}>
                  {sp.sparePart.name} (арт: {sp.sparePart.partNumber})
                </option>
              ))}
            </select>
            {errors.sparePartId && <span className="text-red-500 text-xs">{errors.sparePartId.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-600">Склад *</label>
            <select {...register("storeId")} className={errors.storeId ? inputError : inputBase}>
              <option value="">Выберите склад</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.location}</option>
              ))}
            </select>
            {errors.storeId && <span className="text-red-500 text-xs">{errors.storeId.message}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600">Количество *</label>
              <input type="number" {...register("quantity", { valueAsNumber: true })} className={errors.quantity ? inputError : inputBase} />
              {errors.quantity && <span className="text-red-500 text-xs">{errors.quantity.message}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600">Цена (руб.) *</label>
              <input type="number" step="0.01" {...register("price", { valueAsNumber: true })} className={errors.price ? inputError : inputBase} />
              {errors.price && <span className="text-red-500 text-xs">{errors.price.message}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-600">Категория *</label>
            <select {...register("categoryId")} className={errors.categoryId ? inputError : inputBase}>
              <option value="">Выберите категорию</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <span className="text-red-500 text-xs">{errors.categoryId.message}</span>}
          </div>

          <div className="flex gap-3 justify-end mt-4">
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

export default StorageForm;
