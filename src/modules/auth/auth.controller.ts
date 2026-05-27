import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { loginSchema } from "./auth.validation";
import { loginAdmin, getAdminById } from "./auth.service";
import { ApiError } from "../../utils/appError";

export const login = asyncHandler(async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "Validation error";
        throw ApiError.badRequest(message);
    }

    const result = await loginAdmin(parsed.data);

    sendSuccess(res, result, "Login successful");
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
        throw ApiError.unauthorized("Not authenticated");
    }

    const admin = await getAdminById(req.user.id);
    sendSuccess(res, { user: admin }, "Profile fetched successfully");
});
