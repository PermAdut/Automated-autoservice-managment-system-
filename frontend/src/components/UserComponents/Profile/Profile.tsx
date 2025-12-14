import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetMyProfileQuery, useUpdateMyProfileMutation, UpdateCarDto } from "../../../api/usersApi";
import { useFieldArray, useForm } from "react-hook-form";
import "./Profile.css";

interface ProfileFormData {
  name: string;
  surName: string;
  email: string;
  phone: string;
  cars: UpdateCarDto[];
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMyProfileMutation();
  const [isEditing, setIsEditing] = useState(false);

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
      reset({
        name: profile.name || "",
        surName: profile.surName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        cars: profile.cars?.map((car) => ({
          id: car.id,
          name: car.name || "",
          information: car.information || "",
          year: car.year ? parseInt(car.year) : undefined,
          vin: car.vin || "",
          licensePlate: car.licensePlate || "",
        })) || [],
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile({
        name: data.name,
        surName: data.surName,
        email: data.email,
        phone: data.phone || undefined,
        cars: data.cars.map((car) => ({
          id: car.id,
          name: car.name,
          information: car.information || undefined,
          year: car.year,
          vin: car.vin,
          licensePlate: car.licensePlate || undefined,
        })),
      }).unwrap();
      setIsEditing(false);
      alert("Профиль успешно обновлен!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Не удалось обновить профиль. Попробуйте позже.");
    }
  };

  if (isLoading) return <div className="profile-loading">Загрузка...</div>;
  if (error)
    return (
      <div className="profile-error">
        Ошибка: {error && "status" in error ? String(error.status) : "Неизвестная ошибка"}
      </div>
    );
  if (!profile) return null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">Мой профиль</h1>
        <div className="profile-actions">
          {!isEditing ? (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              Редактировать
            </button>
          ) : (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
              >
                Отмена
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit(onSubmit)}
                disabled={isUpdating}
              >
                {isUpdating ? "Сохранение..." : "Сохранить"}
              </button>
            </>
          )}
          <button className="btn btn-secondary" onClick={() => navigate("/")}>
            На главную
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
        <div className="profile-section">
          <h2 className="profile-section-title">Основная информация</h2>
          <div className="profile-form-grid">
            <div className="form-group">
              <label htmlFor="name">Имя *</label>
              <input
                id="name"
                {...register("name", { required: "Имя обязательно" })}
                disabled={!isEditing}
                className={errors.name ? "error" : ""}
              />
              {errors.name && <span className="error-message">{errors.name.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="surName">Фамилия *</label>
              <input
                id="surName"
                {...register("surName", { required: "Фамилия обязательна" })}
                disabled={!isEditing}
                className={errors.surName ? "error" : ""}
              />
              {errors.surName && <span className="error-message">{errors.surName.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                {...register("email", { required: "Email обязателен" })}
                disabled={!isEditing}
                className={errors.email ? "error" : ""}
              />
              {errors.email && <span className="error-message">{errors.email.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Телефон</label>
              <input
                id="phone"
                {...register("phone")}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-header">
            <h2 className="profile-section-title">Автомобили</h2>
            {isEditing && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => appendCar({ name: "", vin: "", year: undefined, licensePlate: "", information: "" })}
              >
                + Добавить автомобиль
              </button>
            )}
          </div>
          {carFields.length === 0 && !isEditing ? (
            <p className="profile-empty">Нет добавленных автомобилей</p>
          ) : (
            <div className="cars-list">
              {carFields.map((field, index) => (
                <div key={field.id} className="car-item">
                  <div className="car-item-header">
                    <h3>Автомобиль {index + 1}</h3>
                    {isEditing && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeCar(index)}
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                  <div className="car-form-grid">
                    <div className="form-group">
                      <label>Название *</label>
                      <input
                        {...register(`cars.${index}.name`, { required: "Название обязательно" })}
                        disabled={!isEditing}
                        className={errors.cars?.[index]?.name ? "error" : ""}
                      />
                      {errors.cars?.[index]?.name && (
                        <span className="error-message">{errors.cars[index].name?.message}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>VIN *</label>
                      <input
                        {...register(`cars.${index}.vin`, { required: "VIN обязателен" })}
                        disabled={!isEditing}
                        className={errors.cars?.[index]?.vin ? "error" : ""}
                      />
                      {errors.cars?.[index]?.vin && (
                        <span className="error-message">{errors.cars[index].vin?.message}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Год *</label>
                      <input
                        type="number"
                        {...register(`cars.${index}.year`, {
                          required: "Год обязателен",
                          valueAsNumber: true,
                          min: { value: 1900, message: "Год должен быть больше 1900" },
                          max: { value: new Date().getFullYear() + 1, message: "Год не может быть в будущем" },
                        })}
                        disabled={!isEditing}
                        className={errors.cars?.[index]?.year ? "error" : ""}
                      />
                      {errors.cars?.[index]?.year && (
                        <span className="error-message">{errors.cars[index].year?.message}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Номерной знак</label>
                      <input
                        {...register(`cars.${index}.licensePlate`)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="form-group form-group-full">
                      <label>Информация</label>
                      <textarea
                        {...register(`cars.${index}.information`)}
                        disabled={!isEditing}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="profile-form-actions">
            <button type="submit" className="btn btn-primary" disabled={isUpdating}>
              {isUpdating ? "Сохранение..." : "Сохранить изменения"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
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

