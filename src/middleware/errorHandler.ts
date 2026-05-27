import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/appError";
import { sendError } from "../utils/apiResponse";
import { HTTP_STATUS } from "../constants/http";
import { env } from "../config/env";

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    // Known operational error
    if (err instanceof ApiError) {
        sendError(res, err.message, err.statusCode);
        return;
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        sendError(res, err.message, HTTP_STATUS.UNPROCESSABLE_ENTITY);
        return;
    }

    // Mongoose duplicate key
    if ((err as NodeJS.ErrnoException).code === "11000") {
        sendError(res, "Duplicate field value", HTTP_STATUS.CONFLICT);
        return;
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        sendError(res, "Invalid token", HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    if (err.name === "TokenExpiredError") {
        sendError(res, "Token expired", HTTP_STATUS.UNAUTHORIZED);
        return;
    }

    // Unknown error
    console.error("Unhandled error:", err);

    const message = env.isDev ? err.message : "Internal server error";
    const detail = env.isDev ? err.stack : undefined;

    sendError(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR, detail);
}