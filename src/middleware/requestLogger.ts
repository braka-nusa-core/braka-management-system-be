import morgan, { StreamOptions } from "morgan";
import { env } from "../config/env";

const stream: StreamOptions = {
    write: (message: string) => console.info(message.trim()),
};

const skip = () => env.isProd;

export const requestLogger = morgan(
    env.isDev ? "dev" : "combined",
    { stream, skip: env.isProd ? skip : undefined }
);