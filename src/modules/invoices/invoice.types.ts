export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface InvoiceItemInput {
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface CreateInvoiceInput {
    invoiceNumber: string;
    client: string;
    maintenance?: string;
    items: InvoiceItemInput[];
    invoiceDate: string;
    dueDate: string;
    status?: InvoiceStatus;
    notes?: string;
}

export interface UpdateInvoiceInput {
    invoiceNumber?: string;
    client?: string;
    maintenance?: string;
    items?: InvoiceItemInput[];
    invoiceDate?: string;
    dueDate?: string;
    status?: InvoiceStatus;
    notes?: string;
}

export interface InvoiceQuery {
    search?: string;
    status?: InvoiceStatus;
    client?: string;
    page?: string;
    limit?: string;
}