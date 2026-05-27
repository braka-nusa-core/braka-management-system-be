import mongoose from "mongoose";
import { Invoice } from "./invoice.model";
import { Client } from "../clients/client.model";
import { Maintenance } from "../maintenance/maintenance.model";
import { ApiError } from "../../utils/appError";
import type {
    CreateInvoiceInput,
    UpdateInvoiceInput,
    InvoiceItemInput,
    InvoiceQuery,
} from "./invoice.types";

const CLIENT_POPULATE = { path: "client", select: "_id name email" };
const MAINTENANCE_POPULATE = { path: "maintenance", select: "_id serviceName" };

// ── Helpers ────────────────────────────────────────────────────────────────

function isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
}

function calculateItems(items: InvoiceItemInput[]) {
    const computed = items.map((item) => ({
        ...item,
        amount: parseFloat((item.quantity * item.unitPrice).toFixed(2)),
    }));
    const subtotal = parseFloat(
        computed.reduce((sum, i) => sum + i.amount, 0).toFixed(2)
    );
    return { items: computed, subtotal, total: subtotal };
}

async function validateClient(clientId: string): Promise<void> {
    if (!isValidObjectId(clientId)) throw ApiError.badRequest("Invalid client ID");
    const exists = await Client.exists({ _id: clientId });
    if (!exists) throw ApiError.notFound(`Client with ID '${clientId}' not found`);
}

async function validateMaintenance(maintenanceId: string): Promise<void> {
    if (!isValidObjectId(maintenanceId)) throw ApiError.badRequest("Invalid maintenance ID");
    const exists = await Maintenance.exists({ _id: maintenanceId });
    if (!exists) throw ApiError.notFound(`Maintenance contract with ID '${maintenanceId}' not found`);
}

function buildFilter(query: InvoiceQuery) {
    const filter: Record<string, unknown> = {};

    if (query.status) {
        filter["status"] = query.status;
    }

    if (query.client && isValidObjectId(query.client)) {
        filter["client"] = new mongoose.Types.ObjectId(query.client);
    }

    if (query.search) {
        const regex = new RegExp(query.search, "i");
        filter["invoiceNumber"] = regex;
    }

    return filter;
}

// ── Service functions ──────────────────────────────────────────────────────

export async function getAllInvoices(query: InvoiceQuery) {
    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? "10", 10)));
    const skip = (page - 1) * limit;

    const filter = buildFilter(query);

    const [invoices, total] = await Promise.all([
        Invoice.find(filter)
            .populate(CLIENT_POPULATE)
            .populate(MAINTENANCE_POPULATE)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Invoice.countDocuments(filter),
    ]);

    return {
        invoices,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getInvoiceById(id: string) {
    if (!isValidObjectId(id)) throw ApiError.badRequest("Invalid invoice ID");

    const invoice = await Invoice.findById(id)
        .populate(CLIENT_POPULATE)
        .populate(MAINTENANCE_POPULATE)
        .lean();

    if (!invoice) throw ApiError.notFound("Invoice not found");
    return invoice;
}

export async function createInvoice(input: CreateInvoiceInput) {
    await validateClient(input.client);

    if (input.maintenance) {
        await validateMaintenance(input.maintenance);
    }

    // Check duplicate invoice number
    const duplicate = await Invoice.exists({ invoiceNumber: input.invoiceNumber });
    if (duplicate) {
        throw ApiError.conflict(`Invoice number '${input.invoiceNumber}' already exists`);
    }

    const { items, subtotal, total } = calculateItems(input.items);

    const invoice = await Invoice.create({
        invoiceNumber: input.invoiceNumber,
        client: input.client,
        maintenance: input.maintenance,
        items,
        subtotal,
        total,
        invoiceDate: new Date(input.invoiceDate),
        dueDate: new Date(input.dueDate),
        status: input.status ?? "draft",
        notes: input.notes,
    });

    return Invoice.findById(invoice._id)
        .populate(CLIENT_POPULATE)
        .populate(MAINTENANCE_POPULATE)
        .lean();
}

export async function updateInvoice(id: string, input: UpdateInvoiceInput) {
    if (!isValidObjectId(id)) throw ApiError.badRequest("Invalid invoice ID");

    const existing = await Invoice.findById(id);
    if (!existing) throw ApiError.notFound("Invoice not found");

    if (existing.status === "paid") {
        throw ApiError.badRequest("Paid invoices cannot be edited");
    }

    if (input.client) await validateClient(input.client);
    if (input.maintenance) await validateMaintenance(input.maintenance);

    // Check duplicate invoice number (excluding current)
    if (input.invoiceNumber) {
        const duplicate = await Invoice.exists({
            invoiceNumber: input.invoiceNumber,
            _id: { $ne: id },
        });
        if (duplicate) {
            throw ApiError.conflict(`Invoice number '${input.invoiceNumber}' already exists`);
        }
    }

    const updateData: Record<string, unknown> = { ...input };

    if (input.items) {
        const { items, subtotal, total } = calculateItems(input.items);
        updateData["items"] = items;
        updateData["subtotal"] = subtotal;
        updateData["total"] = total;
    }

    if (input.invoiceDate) updateData["invoiceDate"] = new Date(input.invoiceDate);
    if (input.dueDate) updateData["dueDate"] = new Date(input.dueDate);

    const invoice = await Invoice.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    )
        .populate(CLIENT_POPULATE)
        .populate(MAINTENANCE_POPULATE)
        .lean();

    return invoice;
}

export async function deleteInvoice(id: string) {
    if (!isValidObjectId(id)) throw ApiError.badRequest("Invalid invoice ID");

    const invoice = await Invoice.findByIdAndDelete(id).lean();
    if (!invoice) throw ApiError.notFound("Invoice not found");

    return invoice;
}

export async function markInvoiceAsPaid(id: string) {
    if (!isValidObjectId(id)) throw ApiError.badRequest("Invalid invoice ID");

    const invoice = await Invoice.findById(id);
    if (!invoice) throw ApiError.notFound("Invoice not found");

    if (invoice.status === "paid") {
        throw ApiError.badRequest("Invoice is already marked as paid");
    }

    const updated = await Invoice.findByIdAndUpdate(
        id,
        {
            $set: {
                status: "paid",
                paidAt: new Date(),
            },
        },
        { new: true }
    )
        .populate(CLIENT_POPULATE)
        .populate(MAINTENANCE_POPULATE)
        .lean();

    return updated;
}