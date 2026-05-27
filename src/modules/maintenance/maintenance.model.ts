import mongoose, { Document, Schema } from "mongoose";
import type { MaintenanceStatus, BillingType } from "./maintenance.types";

export interface IMaintenance extends Document {
    _id: mongoose.Types.ObjectId;
    client: mongoose.Types.ObjectId;
    serviceName: string;
    billingType: BillingType;
    price: number;
    startDate: Date;
    nextDueDate: Date;
    status: MaintenanceStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const maintenanceSchema = new Schema<IMaintenance>(
    {
        client: {
            type: Schema.Types.ObjectId,
            ref: "Client",
            required: [true, "Client reference is required"],
        },
        serviceName: {
            type: String,
            required: [true, "Service name is required"],
            trim: true,
            maxlength: [200, "Service name cannot exceed 200 characters"],
        },
        billingType: {
            type: String,
            enum: ["monthly", "yearly"],
            required: [true, "Billing type is required"],
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price must be a positive number"],
        },
        startDate: {
            type: Date,
            required: [true, "Start date is required"],
        },
        nextDueDate: {
            type: Date,
            required: [true, "Next due date is required"],
        },
        status: {
            type: String,
            enum: ["active", "paused", "expired", "cancelled"],
            default: "active",
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
maintenanceSchema.index({ client: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ nextDueDate: 1 });
maintenanceSchema.index({ billingType: 1 });

export const Maintenance = mongoose.model<IMaintenance>("Maintenance", maintenanceSchema);