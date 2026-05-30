import { createApp } from "../src/app";
import { connectDatabase } from "../src/config/database";

const app = createApp();

// Connect to database (uses caching pattern — safe for serverless)
connectDatabase();

export default app;
