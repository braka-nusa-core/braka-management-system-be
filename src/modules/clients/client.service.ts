import mongoose from "mongoose";
import { Client } from "./client.model";
import { ApiError } from "../../utils/appError";
import type { CreateClientInput, UpdateClientInput, ClientQuery } from "./client.types";

const CLIENT_POPULATE_FIELDS = "_id name email status picName phone address notes createdAt";

function isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
}

function buildFilter(query: ClientQuery) {
    const filter: Record<string, unknown> = {};

    if (query.status) {
        filter["status"] = query.status;
    }

    if (query.search) {
        const regex = new RegExp(query.search, "i");
        filter["$or"] = [
            { name: regex },
            { picName: regex },
            { email: regex },
        ];
    }

    return filter;
}

export async function getAllClients(query: ClientQuery) {
    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? "10", 10)));
    const skip = (page - 1) * limit;

    const filter = buildFilter(query);

    const [clients, total] = await Promise.all([
        Client.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Client.countDocuments(filter),
    ]);

    return {
        clients,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getClientById(id: string) {
    if (!isValidObjectId(id)) throw ApiError.badRequest("Invalid client ID");

    const client = await Client.findById(id).lean();
    if (!client) throw ApiError.notFound("Client not found");

    return client;
}

export async function createClient(input: CreateClientInput) {
    const existing = await Client.findOne({ email: input.email });
    if (existing) {
        throw ApiError.conflict(`Client with email '${input.email}' already exists`);
    }

    const client = await Client.create(input);
    return client;
}

export async function updateClient(id: string, input: UpdateClientInput) {
    if (!isValidObjectId(id)) throw ApiError.badRequest("Invalid client ID");

    if (input.email) {
        const existing = await Client.findOne({ email: input.email, _id: { $ne: id } });
        if (existing) throw ApiError.conflict(`Email '${input.email}' is already in use`);
    }

    const client = await Client.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
    ).lean();

    if (!client) throw ApiError.notFound("Client not found");
    return client;
}

export async function deleteClient(id: string) {
    if (!isValidObjectId(id)) throw ApiError.badRequest("Invalid client ID");

    const client = await Client.findByIdAndDelete(id).lean();
    if (!client) throw ApiError.notFound("Client not found");

    return client;
}

// Keep for internal use by other modules
export { CLIENT_POPULATE_FIELDS };