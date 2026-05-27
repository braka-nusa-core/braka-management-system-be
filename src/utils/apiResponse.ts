import { Response } from "express";
import { HTTP_STATUS } from "../constants/http";
import type { ApiResponse, PaginationMeta } from "../types";

export function sendSuccess<T>(
    res: Response,
    data: T,
    message = "Success",
    statusCode: number = HTTP_STATUS.OK,
    meta?: PaginationMeta
): Response {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data,
        ...(meta && { meta }),
    };
    return res.status(statusCode).json(response);
}

export function sendCreated<T>(
    res: Response,
    data: T,
    message = "Created successfully"
): Response {
    return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
}

export function sendError(
    res: Response,
    message = "Something went wrong",
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    error?: string
): Response {
    const response: ApiResponse = {
        success: false,
        message,
        ...(error && { error }),
    };
    return res.status(statusCode).json(response);
}

export function sendNotFound(
    res: Response,
    message = "Resource not found"
): Response {
    return sendError(res, message, HTTP_STATUS.NOT_FOUND);
}

export function sendUnauthorized(
    res: Response,
    message = "Unauthorized access"
): Response {
    return sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
}

export function sendBadRequest(
    res: Response,
    message = "Bad request",
    error?: string
): Response {
    return sendError(res, message, HTTP_STATUS.BAD_REQUEST, error);
}
