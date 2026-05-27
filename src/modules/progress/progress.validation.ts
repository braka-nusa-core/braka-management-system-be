import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;

const statusEnum = z.enum([
    "planning",
    "design",
    "development",
    "revision",
    "testing",
    "completed",
]);

const milestoneSchema = z.object({
    title: z
        .string()
        .min(1, "Title cannot be empty")
        .max(200, "Title cannot exceed 200 characters")
        .trim(),
    completed: z.boolean().default(false),
});

export const createProgressSchema = z.object({
    client: z
        .string()
        .regex(objectIdRegex, "Invalid client ID"),

    projectName: z
        .string()
        .min(2, "Project name must be at least 2 characters")
        .max(200, "Project name cannot exceed 200 characters")
        .trim(),

    status: statusEnum.optional().default("planning"),

    progress: z
        .number()
        .min(0, "Progress cannot be less than 0")
        .max(100, "Progress cannot exceed 100")
        .optional()
        .default(0),

    description: z
        .string()
        .max(2000, "Description cannot exceed 2000 characters")
        .trim()
        .optional(),

    milestones: z
        .array(milestoneSchema)
        .optional()
        .default([]),
});

export const updateProgressSchema = createProgressSchema
    .partial()
    .omit({ client: true })
    .extend({
        client: z
            .string()
            .regex(objectIdRegex, "Invalid client ID")
            .optional(),
    });

export type CreateProgressSchema = z.infer<typeof createProgressSchema>;
export type UpdateProgressSchema = z.infer<typeof updateProgressSchema>;
