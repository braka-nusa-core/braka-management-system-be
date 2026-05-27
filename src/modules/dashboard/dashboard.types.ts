export interface UpcomingInvoice {
    _id: string;
    invoiceNumber: string;
    dueDate: Date;
    total: number;
    client: {
        _id: string;
        name: string;
    };
}

export interface ActivityItem {
    type: "invoice_paid" | "invoice_created" | "client_created" | "maintenance_created";
    description: string;
    meta: string;
    timestamp: Date;
}

export interface DashboardSummary {
    totalClients: number;
    activeMaintenance: number;
    pendingInvoices: number;
    overdueInvoices: number;
    monthlyRevenue: number;
    upcomingDueInvoices: UpcomingInvoice[];
    recentActivity: ActivityItem[];
}