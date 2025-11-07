import { z } from "zod";

export const insertUserSchema = z.object({
  name: z
    .string({ required_error: "Full Name is required" })
    .min(2, "Name must be at least 2 characters long"),

  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address"),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

  role: z.enum(["user", "organizer"], {
    required_error: "Please select an account type",
    invalid_type_error: "Invalid account type",
  }),
});


export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email address")
    .max(100, "Email must not exceed 100 characters")
    .trim(),

  password: z
    .string({ required_error: "Password is required" })
});
