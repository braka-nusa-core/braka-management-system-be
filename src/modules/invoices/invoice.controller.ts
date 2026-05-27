import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import { createInvoiceSchema, updateInvoiceSchema } from "./invoice.validation";
import {
    getAllInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    markInvoiceAsPaid,
} from "./invoice.service";
import { ApiError } from "../../utils/appError";
import type { InvoiceQuery } from "./invoice.types";

export const listInvoices = asyncHandler(async (req: Request, res: Response) => {
    const query: InvoiceQuery = {
        search: req.query["search"] as string | undefined,
        status: req.query["status"] as InvoiceQuery["status"],
        client: req.query["client"] as string | undefined,
        page: req.query["page"] as string | undefined,
        limit: req.query["limit"] as string | undefined,
    };

    const result = await getAllInvoices(query);
    sendSuccess(res, result, "Invoices fetched successfully");
});

export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoice = await getInvoiceById(req.params["id"] as string);
    sendSuccess(res, { invoice }, "Invoice fetched successfully");
});

export const addInvoice = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "Validation error";
        throw ApiError.badRequest(message);
    }

    const invoice = await createInvoice(parsed.data);
    sendCreated(res, { invoice }, "Invoice created successfully");
});

export const editInvoice = asyncHandler(async (req: Request, res: Response) => {
    const parsed = updateInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "Validation error";
        throw ApiError.badRequest(message);
    }

    const invoice = await updateInvoice(req.params["id"] as string, parsed.data);
    sendSuccess(res, { invoice }, "Invoice updated successfully");
});

export const removeInvoice = asyncHandler(async (req: Request, res: Response) => {
    await deleteInvoice(req.params["id"] as string);
    sendSuccess(res, null, "Invoice deleted successfully");
});

export const markPaid = asyncHandler(async (req: Request, res: Response) => {
    const invoice = await markInvoiceAsPaid(req.params["id"] as string);
    sendSuccess(res, { invoice }, "Invoice marked as paid successfully");
});
