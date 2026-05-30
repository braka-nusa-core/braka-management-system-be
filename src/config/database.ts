import mongoose from "mongoose";
import { env } from "./env";
import { MESSAGES } from "../constants/messages";

const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

// ── Serverless connection caching ─────────────────────────────
// Cache the connection promise at the module level so it survives
// between warm invocations of the same serverless container.
let cachedPromise: Promise<typeof mongoose> | null = null;

export async function connectDatabase(): Promise<void> {
    // If already connected, reuse the existing connection
    if (mongoose.connection.readyState === 1) {
        return;
    }

    // If a connection is in progress, wait for it
    if (cachedPromise) {
        await cachedPromise;
        return;
    }

    // Register event listeners only on the first connection
    mongoose.connection.on("connected", () => {
        console.info(`✅ ${MESSAGES.DB_CONNECTED}`);
    });

    mongoose.connection.on("disconnected", () => {
        console.warn(`⚠️  ${MESSAGES.DB_DISCONNECTED}`);
        // Reset cache so next request triggers a new connection
        cachedPromise = null;
    });

    mongoose.connection.on("error", (err: Error) => {
        console.error(`❌ ${MESSAGES.DB_ERROR}:`, err.message);
        cachedPromise = null;
    });

    try {
        cachedPromise = mongoose.connect(env.MONGODB_URI, MONGOOSE_OPTIONS);
        await cachedPromise;
    } catch (error) {
        cachedPromise = null;
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to connect to MongoDB: ${msg}`);
        // Do NOT call process.exit() in serverless — let the error propagate
        throw error;
    }
}

export async function disconnectDatabase(): Promise<void> {
    await mongoose.connection.close();
    cachedPromise = null;
    console.info("🔌 MongoDB connection closed");
}