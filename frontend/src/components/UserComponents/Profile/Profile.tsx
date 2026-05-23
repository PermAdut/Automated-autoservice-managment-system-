import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGetMyProfileQuery, useUpdateMyProfileMutation, UpdateCarDto } from "../../../api/usersApi";
import { uploadProfilePhoto } from "../../../api/storageApi";
import { useGetMyVehiclesQuery } from "../../../api/vehiclesApi";
import { useGetRemindersQuery, useCompleteReminderMutation } from "../../../api/diagnosticsApi";
import { useFieldArray, useForm } from "react-hook-form";

const reminderTypeLabels: Record<string, string> = {
  oil_change: "Замена масла",
  tire_rotation: "Ротация шин",
  brake_service: "Тормоза",
  scheduled_maintenance: "Плановое ТО",
  timing_belt: "Ремень ГРМ",
  other: "Другое",
};

const MaintenanceRecommendations: React.FC = () => {
  const { data: vehicles = [] } = useGetMyVehiclesQuery();
  const { data: reminders = [], isLoading } = useGetRemindersQuery({});
  const [completeReminder] = useCompleteReminderMutation();

  const pending = reminders.filter(r => !r.isCompleted);

  if (isLoading || pending.length === 0) return null;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔧</span>
        <h2 className="text-xl font-semibold text-gray-700 m-0">Рекомендации по ТО</h2>
        <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
          {pending.length}
        </span>
      </div>
      <div className="space-y-3">
        {pending.slice(0, 5).map(r => {
          const car = vehicles.find(v => v.id === r.carId);
          return (
            <div key={r.id} className="flex items-center justify-between gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">{reminderTypeLabels[r.type] ?? r.type}</p>
                {car && <p className="text-xs text-gray-500">{car.brand} {car.model}</p>}
                {r.description && <p className="text-xs text-amber-700 mt-0.5">{r.description}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {r.dueDate && (
                  <span className="text-xs text-gray-400">{new Date(r.dueDate).toLocaleDateString("ru-RU")}</span>
                )}
                <button
                  onClick={() => completeReminder(r.id)}
                  className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Выполнено
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {pending.length > 5 && (
        <p className="text-xs text-gray-400 mt-2">+ ещё {pending.length - 5} напоминаний</p>
      )}
    </div>
  );
};

interface ProfileFormData {
  name: string;
  surName: string;
  email: string;
  phone: string;
  cars: UpdateCarDto[];
}

const btnPrimary =
  "px-6 py-3 rounded-md font-semibold cursor-pointer transition-all border-none text-base bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed";
const btnSecondary =
  "px-6 py-3 rounded-md font-semibold cursor-pointer transition-all border-none text-base bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed";
const btnSecondarySmall =
  "px-4 py-2 rounded-md font-semibold cursor-pointer transition-all border-none text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed";
const btnDangerSmall =
  "px-4 py-2 rounded-md font-semibold cursor-pointer transition-all border-none text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed";

const inputClass = (hasError: boolean) =>
  `w-full px-3 py-3 border rounded-md text-base transition-colors focus:outline-none focus:border-indigo-700 focus:ring-2 focus:ring-indigo-700/10 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${
    hasError ? "border-red-600" : "border-gray-300"
  }`;

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMyProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: "",
      surName: "",
      email: "",
      phone: "",
      cars: [],
    },
  });

  const {
    fields: carFields,
    append: appendCar,
    remove: removeCar,
  } = useFieldArray({
    control,
    name: "cars",
  });

  useEffect(() => {
    if (profile) {
      setAvatarUrl(profile.avatarUrl ?? null);
      reset({
        name: profile.name || "",
        surName: profile.surName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        cars: profile.cars?.map((car) => ({
          id: car.id,
          brand: car.brand || "",
          model: car.model || "",
          information: car.information || "",
          year: car.year ? parseInt(car.year) : undefined,
          vin: car.vin || "",
          licensePlate: car.licensePlate || "",
          mileage: car.mileage ?? undefined,
        })) || [],
      });
    }
  }, [profile, reset]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Выберите изображение (JPEG, PNG, WebP)");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const url = await uploadProfilePhoto(file);
      setAvatarUrl(url);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Не удалось загрузить фото. Проверьте настройки хранилища.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile({
        name: data.name,
        surName: data.surName,
        email: data.email,
        phone: data.phone || undefined,
        avatarUrl: avatarUrl ?? undefined,
        cars: data.cars.map((car) => ({
          id: car.id,
          brand: car.brand,
          model: car.model,
          information: car.information || undefined,
          year: car.year,
          vin: car.vin,
          licensePlate: car.licensePlate || undefined,
          mileage: car.mileage,
        })),
      }).unwrap();
      setIsEditing(false);
      alert("Профиль успешно обновлен!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Не удалось обновить профиль. Попробуйте позже.");
    }
  };

  if (isLoading)
    return <div className="text-center p-8 text-lg">Загрузка...</div>;
  if (error)
    return (
      <div className="text-center p-8 text-lg text-red-600">
        Ошибка: {error && "status" in error ? String(error.status) : "Неизвестная ошибка"}
      </div>
    );
  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-8">
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:justify-between md:items-center">
        <h1 className="text-4xl font-bold text-gray-800 m-0">Мой профиль</h1>
        <div className="flex gap-3 flex-wrap">
          {!isEditing ? (
            <button className={btnPrimary} onClick={() => setIsEditing(true)}>
              Редактировать
            </button>
          ) : (
            <>
              <button
                className={btnSecondary}
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
              >
                Отмена
              </button>
              <button
                className={btnPrimary}
                onClick={handleSubmit(onSubmit)}
                disabled={isUpdating}
              >
                {isUpdating ? "Сохранение..." : "Сохранить"}
              </button>
            </>
          )}
          <button className={btnSecondary} onClick={() => navigate("/")}>
            На главную
          </button>
        </div>
      </div>

      <MaintenanceRecommendations />

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg p-8 shadow-sm mt-6">
        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Аватар"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-3xl text-indigo-600 font-bold">
                {(profile.name?.[0] ?? "?").toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center sm:items-start gap-2">
            <p className="text-sm text-gray-500 m-0">Фото профиля</p>
            {isEditing && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  className={btnSecondarySmall}
                  disabled={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploadingAvatar ? "Загрузка..." : "Загрузить фото"}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline bg-transparent border-none cursor-pointer"
                    onClick={() => setAvatarUrl(null)}
                  >
                    Удалить фото
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Основная информация</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
            <div className="flex flex-col">
              <label className="font-medium text-gray-700 mb-2" htmlFor="name">Имя *</label>
              <input
                id="name"
                {...register("name", { required: "Имя обязательно" })}
                disabled={!isEditing}
                className={inputClass(!!errors.name)}
              />
              {errors.name && (
                <span className="text-red-600 text-sm mt-1">{errors.name.message}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="font-medium text-gray-700 mb-2" htmlFor="surName">Фамилия *</label>
              <input
                id="surName"
                {...register("surName", { required: "Фамилия обязательна" })}
                disabled={!isEditing}
                className={inputClass(!!errors.surName)}
              />
              {errors.surName && (
                <span className="text-red-600 text-sm mt-1">{errors.surName.message}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="font-medium text-gray-700 mb-2" htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                {...register("email", { required: "Email обязателен" })}
                disabled={!isEditing}
                className={inputClass(!!errors.email)}
              />
              {errors.email && (
                <span className="text-red-600 text-sm mt-1">{errors.email.message}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="font-medium text-gray-700 mb-2" htmlFor="phone">Телефон</label>
              <input
                id="phone"
                {...register("phone")}
                disabled={!isEditing}
                className={inputClass(false)}
              />
            </div>
          </div>
        </div>

        <div className="mb-8 last:mb-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700 m-0">Автомобили</h2>
            {isEditing && (
              <button
                type="button"
                className={btnSecondarySmall}
                onClick={() =>
                  appendCar({
                    brand: "",
                    model: "",
                    vin: "",
                    year: undefined,
                    licensePlate: "",
                    information: "",
                    mileage: undefined,
                  })
                }
              >
                + Добавить автомобиль
              </button>
            )}
          </div>
          {carFields.length === 0 && !isEditing ? (
            <p className="text-gray-500 italic p-4 text-center">Нет добавленных автомобилей</p>
          ) : (
            <div className="flex flex-col gap-6">
              {carFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-700 m-0">Автомобиль {index + 1}</h3>
                    {isEditing && (
                      <button
                        type="button"
                        className={btnDangerSmall}
                        onClick={() => removeCar(index)}
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-2">Марка *</label>
                      <input
                        {...register(`cars.${index}.brand`, { required: "Марка обязательна" })}
                        disabled={!isEditing}
                        className={inputClass(!!errors.cars?.[index]?.brand)}
                      />
                      {errors.cars?.[index]?.brand && (
                        <span className="text-red-600 text-sm mt-1">
                          {errors.cars[index].brand?.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-2">Модель *</label>
                      <input
                        {...register(`cars.${index}.model`, { required: "Модель обязательна" })}
                        disabled={!isEditing}
                        className={inputClass(!!errors.cars?.[index]?.model)}
                      />
                      {errors.cars?.[index]?.model && (
                        <span className="text-red-600 text-sm mt-1">
                          {errors.cars[index].model?.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-2">VIN *</label>
                      <input
                        {...register(`cars.${index}.vin`, { required: "VIN обязателен" })}
                        disabled={!isEditing}
                        className={inputClass(!!errors.cars?.[index]?.vin)}
                      />
                      {errors.cars?.[index]?.vin && (
                        <span className="text-red-600 text-sm mt-1">
                          {errors.cars[index].vin?.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-2">Год *</label>
                      <input
                        type="number"
                        {...register(`cars.${index}.year`, {
                          required: "Год обязателен",
                          valueAsNumber: true,
                          min: { value: 1900, message: "Год должен быть больше 1900" },
                          max: {
                            value: new Date().getFullYear() + 1,
                            message: "Год не может быть в будущем",
                          },
                        })}
                        disabled={!isEditing}
                        className={inputClass(!!errors.cars?.[index]?.year)}
                      />
                      {errors.cars?.[index]?.year && (
                        <span className="text-red-600 text-sm mt-1">
                          {errors.cars[index].year?.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-2">Номерной знак</label>
                      <input
                        {...register(`cars.${index}.licensePlate`)}
                        disabled={!isEditing}
                        className={inputClass(false)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-2">Пробег (км)</label>
                      <input
                        type="number"
                        {...register(`cars.${index}.mileage`, {
                          valueAsNumber: true,
                          min: { value: 0, message: "Пробег не может быть отрицательным" },
                        })}
                        disabled={!isEditing}
                        className={inputClass(!!errors.cars?.[index]?.mileage)}
                      />
                      {errors.cars?.[index]?.mileage && (
                        <span className="text-red-600 text-sm mt-1">
                          {errors.cars[index].mileage?.message}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col col-span-full">
                      <label className="font-medium text-gray-700 mb-2">Информация</label>
                      <textarea
                        {...register(`cars.${index}.information`)}
                        disabled={!isEditing}
                        rows={3}
                        className={inputClass(false)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex flex-col gap-3 justify-end mt-8 pt-8 border-t border-gray-200 md:flex-row">
            <button
              type="submit"
              className={`${btnPrimary} w-full md:w-auto`}
              disabled={isUpdating}
            >
              {isUpdating ? "Сохранение..." : "Сохранить изменения"}
            </button>
            <button
              type="button"
              className={`${btnSecondary} w-full md:w-auto`}
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
            >
              Отмена
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;
