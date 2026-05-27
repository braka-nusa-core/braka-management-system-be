import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { requestLogger } from "./middleware/requestLogger";
import { notFoundHandler } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import apiRoutes from "./routes/index";
import { env } from "./config/env";

export function createApp(): Application {
    const app = express();

    // ── Security ─────────────────────────────────────────────
    app.use(helmet());

    // ── CORS ─────────────────────────────────────────────────
    app.use(
        cors({
            origin: env.CLIENT_URL,
            credentials: true,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
        })
    );

    // ── Body parsing ──────────────────────────────────────────
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // ── Request logging ───────────────────────────────────────
    app.use(requestLogger);

    // ── API routes ────────────────────────────────────────────
    app.use("/api/v1", apiRoutes);

    // ── 404 handler ───────────────────────────────────────────
    app.use(notFoundHandler);

    // ── Global error handler ──────────────────────────────────
    app.use(errorHandler);

    return app;
}