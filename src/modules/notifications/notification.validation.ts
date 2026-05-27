import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;

export const notificationIdSchema = z.object({
    id: z.string().regex(objectIdRegex, "Invalid notification ID"),
});

export const notificationQuerySchema = z.object({
    type: z
        .enum(["due_soon", "overdue", "payment_received", "system"])
        .optional(),
    isRead: z
        .enum(["true", "false"])
        .optional(),
    page: z
        .string()
        .optional(),
    limit: z
        .string()
        .optional(),
});

export type NotificationIdSchema = z.infer<typeof notificationIdSchema>;
export type NotificationQuerySchema = z.infer<typeof notificationQuerySchema>;