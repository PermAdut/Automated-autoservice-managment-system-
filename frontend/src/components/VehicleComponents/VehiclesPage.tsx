import { useState } from "react";
import {
  useGetMyVehiclesQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  type Vehicle,
  type CreateVehicleDto,
} from "../../api/vehiclesApi";
import { PageLayout } from "../layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { ModalWarning } from "../../widgets/ModalWarning/ModalWarning";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const vehicleSchema = z.object({
  brand: z.string().min(1, "Марка обязательна"),
  model: z.string().min(1, "Модель обязательна"),
  year: z.number().min(1900, "Год должен быть больше 1900").max(2100),
  vin: z.string().min(1, "VIN обязательен"),
  licensePlate: z.string().optional(),
  information: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
}: {
  vehicle: Vehicle;
  onEdit: (v: Vehicle) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🚗</span>
              <h3 className="font-semibold text-gray-900 truncate">
                {vehicle.brand} {vehicle.model}
              </h3>
              <Badge variant="secondary">{vehicle.year}</Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">VIN: <span className="font-mono">{vehicle.vin}</span></p>
            {vehicle.licensePlate && (
              <p className="text-sm text-gray-600 mt-0.5">
                Гос. номер: <span className="font-semibold">{vehicle.licensePlate}</span>
              </p>
            )}
            {vehicle.information && (
              <p className="text-sm text-gray-400 mt-1 truncate">{vehicle.information}</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => onEdit(vehicle)}>
              Изменить
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(vehicle.id)}>
              Удалить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VehicleForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: {
  defaultValues?: Partial<VehicleFormData>;
  onSubmit: (data: VehicleFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="brand">Марка *</Label>
          <Input id="brand" {...register("brand")} placeholder="Toyota" />
          {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}
        </div>
        <div>
          <Label htmlFor="model">Модель *</Label>
          <Input id="model" {...register("model")} placeholder="Camry" />
          {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>}
        </div>
        <div>
          <Label htmlFor="year">Год выпуска *</Label>
          <Input id="year" type="number" {...register("year", { valueAsNumber: true })} placeholder="2020" />
          {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year.message}</p>}
        </div>
        <div>
          <Label htmlFor="vin">VIN *</Label>
          <Input id="vin" {...register("vin")} placeholder="1HGBH41JXMN109186" className="font-mono uppercase" />
          {errors.vin && <p className="text-red-500 text-xs mt-1">{errors.vin.message}</p>}
        </div>
        <div>
          <Label htmlFor="licensePlate">Гос. номер</Label>
          <Input id="licensePlate" {...register("licensePlate")} placeholder="А001АА77" />
        </div>
        <div>
          <Label htmlFor="information">Дополнительно</Label>
          <Input id="information" {...register("information")} placeholder="Цвет, комплектация..." />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Отмена</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}

export default function VehiclesPage() {
  const { data: vehicles = [], isLoading } = useGetMyVehiclesQuery();
  const [createVehicle, { isLoading: isCreating }] = useCreateVehicleMutation();
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();
  const [deleteVehicle] = useDeleteVehicleMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (data: VehicleFormData) => {
    await createVehicle(data as CreateVehicleDto);
    setShowForm(false);
  };

  const handleUpdate = async (data: VehicleFormData) => {
    if (!editingVehicle) return;
    await updateVehicle({ id: editingVehicle.id, data });
    setEditingVehicle(null);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteVehicle(deletingId);
    setDeletingId(null);
  };

  return (
    <PageLayout className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мои автомобили</h1>
          <p className="text-gray-500 text-sm mt-0.5">Управление зарегистрированными транспортными средствами</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Добавить автомобиль</Button>
      </div>

      {(showForm || editingVehicle) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingVehicle ? "Редактировать автомобиль" : "Новый автомобиль"}</CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleForm
              defaultValues={editingVehicle ?? undefined}
              onSubmit={editingVehicle ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditingVehicle(null); }}
              isLoading={isCreating || isUpdating}
            />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-4xl mb-4">🚗</p>
            <p className="text-gray-500">У вас ещё нет добавленных автомобилей</p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>Добавить первый</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {vehicles.map(v => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onEdit={setEditingVehicle}
              onDelete={setDeletingId}
            />
          ))}
        </div>
      )}

      {deletingId && (
        <ModalWarning
          isOpen={!!deletingId}
          message="Удалить автомобиль? История заказов сохранится."
          onConfirm={handleDelete}
          onClose={() => setDeletingId(null)}
        />
      )}
    </PageLayout>
  );
}
