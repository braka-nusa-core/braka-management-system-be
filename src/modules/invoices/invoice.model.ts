import mongoose, { Document, Schema } from "mongoose";
import type { InvoiceStatus } from "./invoice.types";

export interface IInvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

export interface IInvoice extends Document {
    _id: mongoose.Types.ObjectId;
    invoiceNumber: string;
    client: mongoose.Types.ObjectId;
    maintenance?: mongoose.Types.ObjectId;
    items: IInvoiceItem[];
    subtotal: number;
    total: number;
    invoiceDate: Date;
    dueDate: Date;
    paidAt?: Date;
    status: InvoiceStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>(
    {
        description: {
            type: String,
            required: [true, "Item description is required"],
            trim: true,
            maxlength: [300, "Description cannot exceed 300 characters"],
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"],
        },
        unitPrice: {
            type: Number,
            required: [true, "Unit price is required"],
            min: [0, "Unit price must be a positive number"],
        },
        amount: {
            type: Number,
            required: true,
        },
    },
    { _id: false }
);

const invoiceSchema = new Schema<IInvoice>(
    {
        invoiceNumber: {
            type: String,
            required: [true, "Invoice number is required"],
            unique: true,
            trim: true,
            maxlength: [50, "Invoice number cannot exceed 50 characters"],
        },
        client: {
            type: Schema.Types.ObjectId,
            ref: "Client",
            required: [true, "Client reference is required"],
        },
        maintenance: {
            type: Schema.Types.ObjectId,
            ref: "Maintenance",
        },
        items: [invoiceItemSchema],
        subtotal: {
            type: Number,
            required: true,
            min: [0, "Subtotal must be a positive number"],
        },
        total: {
            type: Number,
            required: true,
            min: [0, "Total must be a positive number"],
        },
        invoiceDate: {
            type: Date,
            required: [true, "Invoice date is required"],
        },
        dueDate: {
            type: Date,
            required: [true, "Due date is required"],
        },
        paidAt: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["draft", "sent", "paid", "overdue", "cancelled"],
            default: "draft",
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [1000, "Notes cannot exceed 1000 characters"],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Indexes
invoiceSchema.index({ client: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ maintenance: 1 });

export const Invoice = mongoose.model<IInvoice>("Invoice", invoiceSchema);