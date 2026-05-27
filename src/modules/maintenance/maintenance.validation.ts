import { z } from "zod";

const statusEnum = z.enum(["active", "paused", "expired", "cancelled"]);
const billingTypeEnum = z.enum(["monthly", "yearly"]);

const objectIdRegex = /^[a-f\d]{24}$/i;

export const createMaintenanceSchema = z.object({
    client: z
        .string()
        .trim()
        .min(1, "Client ID is required")
        .regex(objectIdRegex, "Invalid client ID"),

    serviceName: z
        .string()
        .trim()
        .min(1, "Service name is required")
        .min(2, "Service name must be at least 2 characters")
        .max(200, "Service name cannot exceed 200 characters")
        .trim(),

    billingType: billingTypeEnum,

    price: z
        .number()
        .min(0, "Price must be a positive number"),

    startDate: z
        .string()
        .trim()
        .min(1, "Start date is required")
        .refine((d) => !isNaN(Date.parse(d)), "Invalid start date"),

    nextDueDate: z
        .string()
        .trim()
        .min(1, "Next due date is required")
        .refine((d) => !isNaN(Date.parse(d)), "Invalid next due date"),

    status: statusEnum.optional().default("active"),

    notes: z
        .string()
        .max(1000, "Notes cannot exceed 1000 characters")
        .trim()
        .optional(),
});

export const updateMaintenanceSchema = createMaintenanceSchema
    .partial()
    .omit({ client: true })
    .extend({
        client: z
            .string()
            .regex(objectIdRegex, "Invalid client ID")
            .optional(),
    });

export type CreateMaintenanceSchema = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceSchema = z.infer<typeof updateMaintenanceSchema>;
