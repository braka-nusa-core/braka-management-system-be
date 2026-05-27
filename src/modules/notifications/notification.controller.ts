import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import {
    getAllNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "./notification.service";
import { notificationQuerySchema } from "./notification.validation";
import { ApiError } from "../../utils/appError";
import type { NotificationQuery } from "./notification.types";

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
    const parsed = notificationQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "Invalid query params";
        throw ApiError.badRequest(message);
    }

    const query: NotificationQuery = {
        type: parsed.data.type,
        isRead: parsed.data.isRead,
        page: parsed.data.page,
        limit: parsed.data.limit,
    };

    const result = await getAllNotifications(query);
    sendSuccess(res, result, "Notifications fetched successfully");
});

export const readNotification = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params["id"];
    if (!id) throw ApiError.badRequest("Notification ID is required");

    const notification = await markNotificationAsRead(id);
    sendSuccess(res, { notification }, "Notification marked as read");
});

export const readAllNotifications = asyncHandler(async (_req: Request, res: Response) => {
    const result = await markAllNotificationsAsRead();
    sendSuccess(
        res,
        { modifiedCount: result.modifiedCount },
        "All notifications marked as read"
    );
});
