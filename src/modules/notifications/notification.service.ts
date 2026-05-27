import mongoose from "mongoose";
import { Notification } from "./notification.model";
import { ApiError } from "../../utils/appError";
import type { NotificationQuery } from "./notification.types";

const CLIENT_POPULATE = { path: "relatedClient", select: "_id name" };
const INVOICE_POPULATE = { path: "relatedInvoice", select: "_id invoiceNumber" };

// ── Helpers ────────────────────────────────────────────────────────────────

function isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
}

function buildFilter(query: NotificationQuery) {
    const filter: Record<string, unknown> = {};

    if (query.type) {
        filter["type"] = query.type;
    }

    if (query.isRead !== undefined) {
        filter["isRead"] = query.isRead === "true";
    }

    return filter;
}

// ── Service functions ──────────────────────────────────────────────────────

export async function getAllNotifications(query: NotificationQuery) {
    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? "20", 10)));
    const skip = (page - 1) * limit;

    const filter = buildFilter(query);

    const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(filter)
            .populate(CLIENT_POPULATE)
            .populate(INVOICE_POPULATE)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Notification.countDocuments(filter),
        Notification.countDocuments({ isRead: false }),
    ]);

    return {
        notifications,
        unreadCount,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function markNotificationAsRead(id: string) {
    if (!isValidObjectId(id)) {
        throw ApiError.badRequest("Invalid notification ID");
    }

    const notification = await Notification.findById(id);
    if (!notification) {
        throw ApiError.notFound("Notification not found");
    }

    // Idempotent — do not fail if already read
    if (!notification.isRead) {
        notification.isRead = true;
        await notification.save();
    }

    return Notification.findById(id)
        .populate(CLIENT_POPULATE)
        .populate(INVOICE_POPULATE)
        .lean();
}

export async function markAllNotificationsAsRead() {
    const result = await Notification.updateMany(
        { isRead: false },
        { $set: { isRead: true } }
    );

    return { modifiedCount: result.modifiedCount };
}