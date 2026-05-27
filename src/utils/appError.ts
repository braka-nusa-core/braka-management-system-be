import type { AppError } from "../types";

export class ApiError extends Error implements AppError {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        // Restore prototype chain
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message: string): ApiError {
        return new ApiError(message, 400);
    }

    static unauthorized(message = "Unauthorized"): ApiError {
        return new ApiError(message, 401);
    }

    static forbidden(message = "Forbidden"): ApiError {
        return new ApiError(message, 403);
    }

    static notFound(message = "Not found"): ApiError {
        return new ApiError(message, 404);
    }

    static conflict(message: string): ApiError {
        return new ApiError(message, 409);
    }

    static internal(message = "Internal server error"): ApiError {
        return new ApiError(message, 500, false);
    }
}