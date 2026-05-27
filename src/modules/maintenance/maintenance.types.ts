export type MaintenanceStatus = "active" | "paused" | "expired" | "cancelled";
export type BillingType = "monthly" | "yearly";

export interface CreateMaintenanceInput {
    client: string;
    serviceName: string;
    billingType: BillingType;
    price: number;
    startDate: string;
    nextDueDate: string;
    status?: MaintenanceStatus;
    notes?: string;
}

export interface UpdateMaintenanceInput {
    client?: string;
    serviceName?: string;
    billingType?: BillingType;
    price?: number;
    startDate?: string;
    nextDueDate?: string;
    status?: MaintenanceStatus;
    notes?: string;
}

export interface MaintenanceQuery {
    search?: string;
    status?: MaintenanceStatus;
    billingType?: BillingType;
    client?: string;
    page?: string;
    limit?: string;
}