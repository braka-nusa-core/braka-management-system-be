import mongoose from "mongoose";
import { Maintenance } from "./maintenance.model";
import { Client } from "../clients/client.model";
import { ApiError } from "../../utils/appError";
import type {
    CreateMaintenanceInput,
    UpdateMaintenanceInput,
    MaintenanceQuery,
} from "./maintenance.types";

const CLIENT_POPULATE = { path: "client", select: "_id name email" };

// ── Helpers ────────────────────────────────────────────────────────────────

function isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
}

async function validateClient(clientId: string): Promise<void> {
    if (!isValidObjectId(clientId)) {
        throw ApiError.badRequest("Invalid client ID");
    }
    const exists = await Client.exists({ _id: clientId });
    if (!exists) {
        throw ApiError.notFound(`Client with ID '${clientId}' not found`);
    }
}

function buildFilter(query: MaintenanceQuery) {
    const filter: Record<string, unknown> = {};

    if (query.status) {
        filter["status"] = query.status;
    }

    if (query.billingType) {
        filter["billingType"] = query.billingType;
    }

    if (query.client && isValidObjectId(query.client)) {
        filter["client"] = new mongoose.Types.ObjectId(query.client);
    }

    if (query.search) {
        filter["serviceName"] = new RegExp(query.search, "i");
    }

    return filter;
}

// ── Service functions ──────────────────────────────────────────────────────

export async function getAllMaintenance(query: MaintenanceQuery) {
    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? "10", 10)));
    const skip = (page - 1) * limit;

    const filter = buildFilter(query);

    // If search includes client name, we need an aggregation approach;
    // for MVP we search serviceName directly and rely on client filter param
    const [contracts, total] = await Promise.all([
        Maintenance.find(filter)
            .populate(CLIENT_POPULATE)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Maintenance.countDocuments(filter),
    ]);

    return {
        contracts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getMaintenanceById(id: string) {
    if (!isValidObjectId(id)) {
        throw ApiError.badRequest("Invalid maintenance ID");
    }

    const contract = await Maintenance.findById(id)
        .populate(CLIENT_POPULATE)
        .lean();

    if (!contract) {
        throw ApiError.notFound("Maintenance contract not found");
    }

    return contract;
}

export async function createMaintenance(input: CreateMaintenanceInput) {
    await validateClient(input.client);

    const contract = await Maintenance.create({
        ...input,
        startDate: new Date(input.startDate),
        nextDueDate: new Date(input.nextDueDate),
    });

    return Maintenance.findById(contract._id).populate(CLIENT_POPULATE).lean();
}

export async function updateMaintenance(id: string, input: UpdateMaintenanceInput) {
    if (!isValidObjectId(id)) {
        throw ApiError.badRequest("Invalid maintenance ID");
    }

    if (input.client) {
        await validateClient(input.client);
    }

    const updateData: Record<string, unknown> = { ...input };
    if (input.startDate) updateData["startDate"] = new Date(input.startDate);
    if (input.nextDueDate) updateData["nextDueDate"] = new Date(input.nextDueDate);

    const contract = await Maintenance.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate(CLIENT_POPULATE).lean();

    if (!contract) {
        throw ApiError.notFound("Maintenance contract not found");
    }

    return contract;
}

export async function deleteMaintenance(id: string) {
    if (!isValidObjectId(id)) {
        throw ApiError.badRequest("Invalid maintenance ID");
    }

    const contract = await Maintenance.findByIdAndDelete(id).lean();
    if (!contract) {
        throw ApiError.notFound("Maintenance contract not found");
    }

    return contract;
}