import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;
const statusEnum = z.enum(["draft", "sent", "paid", "overdue", "cancelled"]);

const invoiceItemSchema = z.object({
    description: z
        .string()
        .trim()
        .min(1, "Item description is required")
        .min(1, "Description cannot be empty")
        .max(300, "Description cannot exceed 300 characters")
        .trim(),
    quantity: z
        .number()
        .min(1, "Quantity must be at least 1"),
    unitPrice: z
        .number()
        .min(0, "Unit price must be a positive number"),
});

export const createInvoiceSchema = z.object({
    invoiceNumber: z
        .string()
        .trim()
        .min(1, "Invoice number is required")
        .min(1, "Invoice number cannot be empty")
        .max(50, "Invoice number cannot exceed 50 characters")
        .trim(),

    client: z
        .string()
        .trim()
        .min(1, "Client ID is required")
        .regex(objectIdRegex, "Invalid client ID"),

    maintenance: z
        .string()
        .regex(objectIdRegex, "Invalid maintenance ID")
        .optional(),

    items: z
        .array(invoiceItemSchema)
        .min(1, "Invoice must have at least one item"),

    invoiceDate: z
        .string()
        .trim()
        .min(1, "Invoice date is required")
        .refine((d) => !isNaN(Date.parse(d)), "Invalid invoice date"),

    dueDate: z
        .string()
        .trim()
        .min(1, "Due date is required")
        .refine((d) => !isNaN(Date.parse(d)), "Invalid due date"),

    status: statusEnum.optional().default("draft"),

    notes: z
        .string()
        .max(1000, "Notes cannot exceed 1000 characters")
        .trim()
        .optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export type CreateInvoiceSchema = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceSchema = z.infer<typeof updateInvoiceSchema>;
