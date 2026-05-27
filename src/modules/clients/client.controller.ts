import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import { createClientSchema, updateClientSchema } from "./client.validation";
import {
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
} from "./client.service";
import { ApiError } from "../../utils/appError";
import type { ClientQuery } from "./client.types";

export const listClients = asyncHandler(async (req: Request, res: Response) => {
    const query: ClientQuery = {
        search: req.query["search"] as string | undefined,
        status: req.query["status"] as ClientQuery["status"],
        page: req.query["page"] as string | undefined,
        limit: req.query["limit"] as string | undefined,
    };

    const result = await getAllClients(query);
    sendSuccess(res, result, "Clients fetched successfully");
});

export const getClient = asyncHandler(async (req: Request, res: Response) => {
    const client = await getClientById(req.params["id"] as string);
    sendSuccess(res, { client }, "Client fetched successfully");
});

export const addClient = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createClientSchema.safeParse(req.body);
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "Validation error";
        throw ApiError.badRequest(message);
    }

    const client = await createClient(parsed.data);
    sendCreated(res, { client }, "Client created successfully");
});

export const editClient = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateClientSchema.safeParse(req.body);
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "Validation error";
        throw ApiError.badRequest(message);
    }

    const client = await updateClient(req.params["id"] as string, parsed.data);
    sendSuccess(res, { client }, "Client updated successfully");
});

export const removeClient = asyncHandler(async (req: Request, res: Response) => {
    await deleteClient(req.params["id"] as string);
    sendSuccess(res, null, "Client deleted successfully");
});
