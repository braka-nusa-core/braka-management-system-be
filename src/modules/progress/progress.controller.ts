import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import { createProgressSchema, updateProgressSchema } from "./progress.validation";
import {
    getAllProgress,
    getProgressById,
    getProgressByToken,
    createProgress,
    updateProgress,
    deleteProgress,
    regenerateToken,
} from "./progress.service";
import { ApiError } from "../../utils/appError";
import type { ProgressQuery } from "./progress.types";

// ── Admin controllers ──────────────────────────────────────────────────────

export const listProgress = asyncHandler(async (req: Request, res: Response) => {
    const query: ProgressQuery = {
        search: req.query["search"] as string | undefined,
        status: req.query["status"] as ProgressQuery["status"],
        client: req.query["client"] as string | undefined,
        page: req.query["page"] as string | undefined,
        limit: req.query["limit"] as string | undefined,
    };

    const result = await getAllProgress(query);
    sendSuccess(res, result, "Progress projects fetched successfully");
});

export const getProgress = asyncHandler(async (req: Request, res: Response) => {
    const project = await getProgressById(req.params["id"] as string);
    sendSuccess(res, { project }, "Progress project fetched successfully");
});

export const addProgress = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createProgressSchema.safeParse(req.body);
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "Validation error";
        throw ApiError.badRequest(message);
    }

    const project = await createProgress(parsed.data);
    sendCreated(res, { project }, "Progress project created successfully");
});

export const editProgress = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateProgressSchema.safeParse(req.body);
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "Validation error";
        throw ApiError.badRequest(message);
    }

    const project = await updateProgress(req.params["id"] as string, parsed.data);
    sendSuccess(res, { project }, "Progress project updated successfully");
});

export const removeProgress = asyncHandler(async (req: Request, res: Response) => {
    await deleteProgress(req.params["id"] as string);
    sendSuccess(res, null, "Progress project deleted successfully");
});

export const regenerateProgressToken = asyncHandler(async (req: Request, res: Response) => {
    const result = await regenerateToken(req.params["id"] as string);
    sendSuccess(res, result, "Public token regenerated successfully");
});

// ── Public controller ──────────────────────────────────────────────────────

export const getPublicProgress = asyncHandler(async (req: Request, res: Response) => {
    const token = req.params["token"];
    if (!token) throw ApiError.badRequest("Token is required");

    const project = await getProgressByToken(token);

    const clientName = (project.client as unknown as { name: string } | null)?.name ?? "";

    // Return only public-safe fields
    sendSuccess(
        res,
        {
            clientName,
            projectName: project.projectName,
            status: project.status,
            progress: project.progress,
            description: project.description ?? "",
            lastUpdated: project.lastUpdated,
            milestones: project.milestones,
        },
        "Progress fetched successfully"
    );
});
