import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

const app = createApp();

async function bootstrap(): Promise<void> {
    // Connect DB first
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
        console.info(`🚀 Braka API running on port ${env.PORT} [${env.NODE_ENV}]`);
        console.info(`📡 Health: http://localhost:${env.PORT}/api/v1/health`);
    });

    // ── Graceful shutdown ──────────────────────────────────────
    const shutdown = async (signal: string): Promise<void> => {
        console.info(`\n⚙️  Received ${signal}. Shutting down gracefully...`);
        server.close(async () => {
            const { disconnectDatabase } = await import("./config/database");
            await disconnectDatabase();
            console.info("✅ Server closed");
            process.exit(0);
        });

        // Force exit if graceful shutdown takes too long
        setTimeout(() => {
            console.error("❌ Forced shutdown after timeout");
            process.exit(1);
        }, 10_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("unhandledRejection", (reason: unknown) => {
        console.error("Unhandled Rejection:", reason);
        process.exit(1);
    });

    process.on("uncaughtException", (error: Error) => {
        console.error("Uncaught Exception:", error);
        process.exit(1);
    });
}

bootstrap();