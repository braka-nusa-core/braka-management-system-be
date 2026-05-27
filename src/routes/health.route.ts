import { Router, Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { MESSAGES } from "../constants/messages";
import mongoose from "mongoose";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus: Record<number, string> = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
    };

    sendSuccess(res, {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`,
        database: dbStatus[dbState] ?? "unknown",
        node: process.version,
        env: process.env["NODE_ENV"] ?? "development",
    }, MESSAGES.SERVER_RUNNING);
});

export default router;