import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

function optionalEnv(key: string, fallback: string): string {
    return process.env[key] ?? fallback;
}

export const env = {
    NODE_ENV: optionalEnv("NODE_ENV", "development"),
    PORT: parseInt(optionalEnv("PORT", "5000"), 10),
    MONGODB_URI: requireEnv("MONGODB_URI"),
    JWT_SECRET: requireEnv("JWT_SECRET"),
    JWT_EXPIRES_IN: optionalEnv("JWT_EXPIRES_IN", "7d"),
    CLIENT_URL: optionalEnv("CLIENT_URL", "http://localhost:3000"),
    ADMIN_EMAIL: optionalEnv("ADMIN_EMAIL", "admin@braka.co.id"),
    ADMIN_PASSWORD: optionalEnv("ADMIN_PASSWORD", "admin123456"),
    ADMIN_NAME: optionalEnv("ADMIN_NAME", "Braka Admin"),
    isDev: optionalEnv("NODE_ENV", "development") === "development",
    isProd: optionalEnv("NODE_ENV", "development") === "production",
} as const;