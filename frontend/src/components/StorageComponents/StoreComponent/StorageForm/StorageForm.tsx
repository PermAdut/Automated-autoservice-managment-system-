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
import "./StorageForm.css";

const stockSchema = z.object({
  sparePartId: z.number().int().positive("Укажите запчасть"),
  storeId: z.number().int().positive("Выберите склад"),
  price: z.number().nonnegative("Цена не может быть отрицательной"),
  quantity: z
    .number()
    .int()
    .nonnegative("Количество не может быть отрицательным"),
  categoryId: z.number().int().positive("Выберите категорию"),
});

type StockFormValues = z.infer<typeof stockSchema>;

interface StorageFormProps {
  stock: SparePartStock | null;
  onClose: () => void;
  onSubmit: (payload: SpareStockPayload, sparePartId?: number) => Promise<void>;
}

const StorageForm = ({ stock, onClose, onSubmit }: StorageFormProps) => {
  const { data: sparePartsList = [] } = useGetSparePartsQuery({
    sortBy: "name",
    sortOrder: "asc",
  });
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
      sparePartId: stock?.sparePart?.id,
      storeId: (stock as any)?.store_id ?? (stock as any)?.storeId,
      price:
        typeof stock?.sparePart?.price === "string"
          ? parseFloat(stock?.sparePart?.price)
          : (stock?.sparePart?.price as number | undefined),
      quantity: stock?.quantity,
      categoryId: stock?.sparePart?.category?.id,
    },
  });

  useEffect(() => {
    reset({
      sparePartId: stock?.sparePart?.id,
      storeId: (stock as any)?.store_id ?? (stock as any)?.storeId,
      price:
        typeof stock?.sparePart?.price === "string"
          ? parseFloat(stock?.sparePart?.price)
          : (stock?.sparePart?.price as number | undefined),
      quantity: stock?.quantity,
      categoryId: stock?.sparePart?.category?.id,
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
    <div className="storage-form-overlay" onClick={onClose}>
      <div className="storage-form-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="storage-form-title">
          {stock
            ? "Редактировать запчасть на складе"
            : "Добавить запчасть на склад"}
        </h3>
        <form className="storage-form" onSubmit={handleSubmit(onSubmitForm)}>
          <label>
            Запчасть *
            <select
              {...register("sparePartId", { valueAsNumber: true })}
              className={errors.sparePartId ? "error" : ""}
            >
              <option value="">Выберите запчасть</option>
              {sparePartsList.map((sp) => (
                <option key={sp.sparePart.id} value={sp.sparePart.id}>
                  {sp.sparePart.name} (арт: {sp.sparePart.partNumber})
                </option>
              ))}
            </select>
            {errors.sparePartId && (
              <span className="error-message">
                {errors.sparePartId.message}
              </span>
            )}
          </label>
          <label>
            Склад *
            <select
              {...register("storeId", { valueAsNumber: true })}
              className={errors.storeId ? "error" : ""}
            >
              <option value="">Выберите склад</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.location}
                </option>
              ))}
            </select>
            {errors.storeId && (
              <span className="error-message">{errors.storeId.message}</span>
            )}
          </label>
          <label>
            Количество *
            <input
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              className={errors.quantity ? "error" : ""}
            />
            {errors.quantity && (
              <span className="error-message">{errors.quantity.message}</span>
            )}
          </label>
          <label>
            Цена *
            <input
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              className={errors.price ? "error" : ""}
            />
            {errors.price && (
              <span className="error-message">{errors.price.message}</span>
            )}
          </label>
          <label>
            Категория *
            <select
              {...register("categoryId", { valueAsNumber: true })}
              className={errors.categoryId ? "error" : ""}
            >
              <option value="">Выберите категорию</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="error-message">{errors.categoryId.message}</span>
            )}
          </label>
          <div className="storage-form-actions">
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

export default StorageForm;
