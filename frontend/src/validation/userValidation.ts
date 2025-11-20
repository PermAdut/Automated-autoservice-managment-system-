import { z } from "zod";

export const createUserSchema = z.object({
  login: z.string().min(3, "Login must be at least 3 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  surName: z.string().min(2, "Surname must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  passportIdentityNumber: z.string().min(5, "Identity number is required"),
  passportNationality: z.string().min(2, "Nationality is required"),
  passportBirthDate: z.string().min(1, "Birth date is required"),
  passportGender: z.enum(["M", "F"] as const, {
    required_error: "Gender is required",
  }),
  passportExpirationDate: z.string().min(1, "Expiration date is required"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  surName: z
    .string()
    .min(2, "Surname must be at least 2 characters")
    .optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone must be at least 10 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
