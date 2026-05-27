import mongoose from "mongoose";
import { Admin } from "../modules/auth/auth.model";
import { connectDatabase, disconnectDatabase } from "../config/database";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function seedAdmin(): Promise<void> {
    await connectDatabase();

    const email = process.env["ADMIN_EMAIL"] ?? "admin@braka.co.id";
    const password = process.env["ADMIN_PASSWORD"] ?? "admin123456";
    const name = process.env["ADMIN_NAME"] ?? "Braka Admin";

    const existing = await Admin.findOne({ email });

    if (existing) {
        console.info(`ℹ️  Admin already exists: ${email}`);
        await disconnectDatabase();
        return;
    }

    await Admin.create({ name, email, password });

    console.info(`✅ Admin seeded: ${email}`);
    console.info(`🔑 Default password: ${password}`);
    console.warn("⚠️  Change the default password after first login!");

    await disconnectDatabase();
}

seedAdmin().catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("❌ Seed failed:", msg);
    void mongoose.connection.close();
    process.exit(1);
});