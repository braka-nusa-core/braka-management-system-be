import { z } from "zod";

const statusEnum = z.enum(["active", "inactive", "prospect"]);

export const createClientSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(150, "Name cannot exceed 150 characters")
        .trim(),
    picName: z
        .string()
        .min(2, "PIC name must be at least 2 characters")
        .max(100, "PIC name cannot exceed 100 characters")
        .trim(),
    email: z
        .string()
        .email("Invalid email address")
        .toLowerCase()
        .trim(),
    phone: z
        .string()
        .min(6, "Phone must be at least 6 characters")
        .max(20, "Phone cannot exceed 20 characters")
        .trim(),
    address: z
        .string()
        .min(5, "Address must be at least 5 characters")
        .max(300, "Address cannot exceed 300 characters")
        .trim(),
    notes: z
        .string()
        .max(1000, "Notes cannot exceed 1000 characters")
        .trim()
        .optional(),
    status: statusEnum.optional().default("active"),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientSchema = z.infer<typeof createClientSchema>;
export type UpdateClientSchema = z.infer<typeof updateClientSchema>;
