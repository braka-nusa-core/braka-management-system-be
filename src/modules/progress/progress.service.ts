import mongoose from "mongoose";
import { Progress, generatePublicToken } from "./progress.model";
import { Client } from "../clients/client.model";
import { ApiError } from "../../utils/appError";
import type {
    CreateProgressInput,
    UpdateProgressInput,
    ProgressQuery,
} from "./progress.types";

const CLIENT_POPULATE = { path: "client", select: "_id name email" };

// ── Helpers ────────────────────────────────────────────────────────────────

function isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
}

async function validateClient(clientId: string): Promise<void> {
    if (!isValidObjectId(clientId)) throw ApiError.badRequest("Invalid client ID");
    const exists = await Client.exists({ _id: clientId });
    if (!exists) throw ApiError.notFound(`Client with ID '${clientId}' not found`);
}

function buildFilter(query: ProgressQuery) {
    const filter: Record<string, unknown> = {};

    if (query.status) {
        filter["status"] = query.status;
    }

    if (query.client && isValidObjectId(query.client)) {
        filter["client"] = new mongoose.Types.ObjectId(query.client);
    }

    if (query.search) {
        filter["projectName"] = new RegExp(query.search, "i");
    }

    return filter;
}

// ── Service functions ──────────────────────────────────────────────────────

export async function getAllProgress(query: ProgressQuery) {
    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? "10", 10)));
    const skip = (page - 1) * limit;

    const filter = buildFilter(query);

    const [projects, total] = await Promise.all([
        Progress.find(filter)
            .populate(CLIENT_POPULATE)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Progress.countDocuments(filter),
    ]);

    return {
        projects,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getProgressById(id: string) {
    if (!isValidObjectId(id)) throw ApiError.badRequest("Invalid progress ID");

    const project = await Progress.findById(id)
        .populate(CLIENT_POPULATE)
        .lean();

    if (!project) throw ApiError.notFound("Progress project not found");
    return project;
}

export async function getProgressByToken(token: string) {
    const project = await Progress.findOne({ publicToken: token })
        .populate({ path: "client", select: "name" })
        .lean();

    if (!project) throw ApiError.notFound("Progress page not found or link is invalid");
    return project;
}

export async function createProgress(input: CreateProgressInput) {
    await validateClient(input.client);

    const project = await Progress.create(input);

    return Progress.findById(project._id)
        .populate(CLIENT_POPULATE)
        .lean();
}

export async function updateProgress(id: string, input: UpdateProgressInput) {
    if (!isValidObjectId(id)) throw ApiError.badRequest("Invalid progress ID");

    if (input.client) await validateClient(input.client);

    const updateData = {
        ...input,
        lastUpdated: new Date(),
    };

    const project = await Progress.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    )
        .populate(CLIENT_POPULATE)
        .lean();

    if (!project) throw ApiError.notFound("Progress project not found");
    return project;
}

export async function deleteProgress(id: string) {
    if (!isValidObjectId(id)) throw ApiError.badRequest("Invalid progress ID");

    const project = await Progress.findByIdAndDelete(id).lean();
    if (!project) throw ApiError.notFound("Progress project not found");
    return project;
}

export async function regenerateToken(id: string) {
    if (!isValidObjectId(id)) throw ApiError.badRequest("Invalid progress ID");

    const newToken = generatePublicToken();

    const project = await Progress.findByIdAndUpdate(
        id,
        { $set: { publicToken: newToken } },
        { new: true }
    ).lean();

    if (!project) throw ApiError.notFound("Progress project not found");
    return { publicToken: project.publicToken };
}