export type NotificationType = "due_soon" | "overdue" | "payment_received" | "system";

export interface NotificationQuery {
    type?: NotificationType;
    isRead?: string;
    page?: string;
    limit?: string;
}