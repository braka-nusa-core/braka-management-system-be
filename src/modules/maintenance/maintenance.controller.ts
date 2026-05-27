import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import { createMaintenanceSchema, updateMaintenanceSchema } from "./maintenance.validation";
import {
    getAllMaintenance,
    getMaintenanceById,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
} from "./maintenance.service";
import { ApiError } from "../../utils/appError";
import type { MaintenanceQuery } from "./maintenance.types";

export const listMaintenance = asyncHandler(async (req: Request, res: Response) => {
    const query: MaintenanceQuery = {
        search: req.query["search"] as string | undefined,
        status: req.query["status"] as MaintenanceQuery["status"],
        billingType: req.query["billingType"] as MaintenanceQuery["billingType"],
        client: req.query["client"] as string | undefined,
        page: req.query["page"] as string | undefined,
        limit: req.query["limit"] as string | undefined,
    };

    const result = await getAllMaintenance(query);
    sendSuccess(res, result, "Maintenance contracts fetched successfully");
});

export const getMaintenance = asyncHandler(async (req: Request, res: Response) => {
    const contract = await getMaintenanceById(req.params["id"] as string);
    sendSuccess(res, { contract }, "Maintenance contract fetched successfully");
});

export const addMaintenance = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createMaintenanceSchema.safeParse(req.body);
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "Validation error";
        throw ApiError.badRequest(message);
    }

    const contract = await createMaintenance(parsed.data);
    sendCreated(res, { contract }, "Maintenance contract created successfully");
});

export const editMaintenance = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateMaintenanceSchema.safeParse(req.body);
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "Validation error";
        throw ApiError.badRequest(message);
    }

    const contract = await updateMaintenance(req.params["id"] as string, parsed.data);
    sendSuccess(res, { contract }, "Maintenance contract updated successfully");
});

export const removeMaintenance = asyncHandler(async (req: Request, res: Response) => {
    await deleteMaintenance(req.params["id"] as string);
    sendSuccess(res, null, "Maintenance contract deleted successfully");
});
