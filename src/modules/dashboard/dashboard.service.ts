import { Client } from "../clients/client.model";
import { Maintenance } from "../maintenance/maintenance.model";
import { Invoice } from "../invoices/invoice.model";
import type { DashboardSummary, ActivityItem } from "./dashboard.types";

// ── Helpers ────────────────────────────────────────────────────────────────

function startOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

function endOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

// ── Service ────────────────────────────────────────────────────────────────

export async function getDashboardSummary(): Promise<DashboardSummary> {
    const now = new Date();
    const monthStart = startOfMonth();
    const monthEnd = endOfMonth();

    // Run all queries in parallel
    const [
        totalClients,
        activeMaintenance,
        pendingInvoices,
        overdueInvoices,
        revenueResult,
        upcomingDueInvoices,
        recentInvoicesPaid,
        recentInvoicesCreated,
        recentClients,
        recentMaintenance,
    ] = await Promise.all([

        // 1. Total clients
        Client.countDocuments(),

        // 2. Active maintenance contracts
        Maintenance.countDocuments({ status: "active" }),

        // 3. Pending invoices (draft + sent)
        Invoice.countDocuments({ status: { $in: ["draft", "sent"] } }),

        // 4. Overdue invoices
        Invoice.countDocuments({ status: "overdue" }),

        // 5. Monthly revenue from paid invoices
        Invoice.aggregate<{ total: number }>([
            {
                $match: {
                    status: "paid",
                    paidAt: { $gte: monthStart, $lte: monthEnd },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$total" },
                },
            },
        ]),

        // 6. Upcoming due invoices (not paid/cancelled, due >= today, limit 5)
        Invoice.find({
            status: { $in: ["draft", "sent", "overdue"] },
            dueDate: { $gte: now },
        })
            .populate({ path: "client", select: "_id name" })
            .select("invoiceNumber dueDate total client")
            .sort({ dueDate: 1 })
            .limit(5)
            .lean(),

        // 7. Recent paid invoices (for activity)
        Invoice.find({ status: "paid" })
            .populate({ path: "client", select: "name" })
            .select("invoiceNumber paidAt client")
            .sort({ paidAt: -1 })
            .limit(4)
            .lean(),

        // 8. Recent created invoices (for activity)
        Invoice.find()
            .populate({ path: "client", select: "name" })
            .select("invoiceNumber createdAt client")
            .sort({ createdAt: -1 })
            .limit(3)
            .lean(),

        // 9. Recent clients created (for activity)
        Client.find()
            .select("name createdAt")
            .sort({ createdAt: -1 })
            .limit(3)
            .lean(),

        // 10. Recent maintenance created (for activity)
        Maintenance.find()
            .populate({ path: "client", select: "name" })
            .select("serviceName createdAt client")
            .sort({ createdAt: -1 })
            .limit(3)
            .lean(),
    ]);

    // ── Build activity list ──────────────────────────────────────────────────

    const activityItems: ActivityItem[] = [];

    for (const inv of recentInvoicesPaid) {
        const clientName = (inv.client as unknown as { name: string } | null)?.name ?? "Unknown client";
        activityItems.push({
            type: "invoice_paid",
            description: `Invoice ${inv.invoiceNumber} was paid`,
            meta: clientName,
            timestamp: (inv.paidAt ?? inv.updatedAt) as Date,
        });
    }

    for (const inv of recentInvoicesCreated) {
        const clientName = (inv.client as unknown as { name: string } | null)?.name ?? "Unknown client";
        activityItems.push({
            type: "invoice_created",
            description: `Invoice ${inv.invoiceNumber} was created`,
            meta: clientName,
            timestamp: inv.createdAt as Date,
        });
    }

    for (const client of recentClients) {
        activityItems.push({
            type: "client_created",
            description: `New client added`,
            meta: client.name as string,
            timestamp: client.createdAt as Date,
        });
    }

    for (const mnt of recentMaintenance) {
        const clientName = (mnt.client as unknown as { name: string } | null)?.name ?? "Unknown client";
        activityItems.push({
            type: "maintenance_created",
            description: `Maintenance contract created`,
            meta: `${mnt.serviceName as string} · ${clientName}`,
            timestamp: mnt.createdAt as Date,
        });
    }

    // Sort by timestamp desc and take top 8
    const recentActivity = activityItems
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 8);

    return {
        totalClients,
        activeMaintenance,
        pendingInvoices,
        overdueInvoices,
        monthlyRevenue: revenueResult[0]?.total ?? 0,
        upcomingDueInvoices: upcomingDueInvoices as unknown as DashboardSummary["upcomingDueInvoices"],
        recentActivity,
    };
}