import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { ApiError } from "../../utils/appError";
import type { JwtPayload } from "./auth.types";

export function protect(req: Request, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(ApiError.unauthorized("No token provided"));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return next(ApiError.unauthorized("No token provided"));
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: "admin",
        };
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return next(ApiError.unauthorized("Token has expired"));
        }
        return next(ApiError.unauthorized("Invalid token"));
    }
}