import { z } from "zod";

export const insertEventSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(100, { message: "Title cannot exceed 100 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long" })
    .max(1000, { message: "Description cannot exceed 1000 characters" }),
  date: z
    .string()
    .min(1, { message: "Date is required" })
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" })
    .refine(
      (val) => {
        const selectedDate = new Date(val);
        const now = new Date();
        return selectedDate >= now;
      },
      { message: "Event date must be in the future" }
    ),

  location: z
    .string()
    .min(3, { message: "Location must be at least 3 characters long" }),
  seats: z
    .coerce
    .number({ invalid_type_error: "Seats must be a number" }) // 👈 this automatically converts
    .int({ message: "Seats must be an integer" })
    .positive({ message: "Seats must be greater than 0" }),
  imageUrl: z
    .string()
    .url({ message: "Image must be a valid URL" })
    .optional()
    .or(z.literal('')),
});
