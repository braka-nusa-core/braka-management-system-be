export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginationQuery {
    page?: string;
    limit?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface AppError extends Error {
    statusCode: number;
    isOperational: boolean;
}