import mongoose from "mongoose";
import { env } from "./env";
import { MESSAGES } from "../constants/messages";

const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

export async function connectDatabase(): Promise<void> {
    try {
        mongoose.connection.on("connected", () => {
            console.info(`✅ ${MESSAGES.DB_CONNECTED}: ${env.MONGODB_URI}`);
        });

        mongoose.connection.on("disconnected", () => {
            console.warn(`⚠️  ${MESSAGES.DB_DISCONNECTED}`);
        });

        mongoose.connection.on("error", (err: Error) => {
            console.error(`❌ ${MESSAGES.DB_ERROR}:`, err.message);
        });

        await mongoose.connect(env.MONGODB_URI, MONGOOSE_OPTIONS);
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to connect to MongoDB: ${msg}`);
        process.exit(1);
    }
}

export async function disconnectDatabase(): Promise<void> {
    await mongoose.connection.close();
    console.info("🔌 MongoDB connection closed");
}