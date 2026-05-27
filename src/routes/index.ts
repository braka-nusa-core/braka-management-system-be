import { Router } from "express";
import healthRouter from "./health.route";
import authRouter from "../modules/auth/auth.routes";
import clientRouter from "../modules/clients/client.routes";
import maintenanceRouter from "../modules/maintenance/maintenance.routes";
import invoiceRouter from "../modules/invoices/invoice.routes";
import notificationRouter from "../modules/notifications/notification.routes";
import dashboardRouter from "../modules/dashboard/dashboard.routes";
import progressRouter from "../modules/progress/progress.routes";

const router = Router();

// ── Health ──────────────────────────────────────────────────
router.use("/", healthRouter);

// ── Auth ────────────────────────────────────────────────────
router.use("/auth", authRouter);

// ── Dashboard ────────────────────────────────────────────────
router.use("/dashboard", dashboardRouter);

// ── Clients ─────────────────────────────────────────────────
router.use("/clients", clientRouter);

// ── Maintenance ─────────────────────────────────────────────
router.use("/maintenance", maintenanceRouter);

// ── Invoices ─────────────────────────────────────────────────
router.use("/invoices", invoiceRouter);

// ── Notifications ────────────────────────────────────────────
router.use("/notifications", notificationRouter);

// ── Progress ─────────────────────────────────────────────────
router.use("/progress", progressRouter);

export default router;